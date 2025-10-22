#!/usr/bin/env node

/**
 * Migration utility for unified database schema
 * Handles migration from old schema to new unified questions/ratings tables
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config();

// Database connection with error handling
function createDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  return neon(process.env.DATABASE_URL);
}

// Test database connection
async function testConnection(sql) {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// Check if table exists
async function tableExists(sql, tableName) {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = ${tableName}
    )
  `;
  return result[0].exists;
}

// Migrate old ratings table to new normalized structure
async function migrateRatingsData(sql) {
  console.log('📊 Migrating ratings data to normalized structure...');
  
  const oldRatingsExists = await tableExists(sql, 'ratings');
  if (!oldRatingsExists) {
    console.log('  No old ratings table found, skipping ratings migration');
    return 0;
  }

  // Check if old table has the old structure (with ratings_data JSONB)
  const oldStructure = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ratings' AND column_name = 'ratings_data'
  `;

  if (oldStructure.length === 0) {
    console.log('  Ratings table already has new structure, skipping migration');
    return 0;
  }

  // Get old ratings data
  const oldRatings = await sql`SELECT question_slug, ratings_data FROM ratings WHERE ratings_data IS NOT NULL`;
  
  let migratedCount = 0;
  
  for (const row of oldRatings) {
    try {
      const ratingsData = row.ratings_data;
      
      // Extract individual ratings from JSONB structure
      if (ratingsData && typeof ratingsData === 'object') {
        for (const [userHash, rating] of Object.entries(ratingsData)) {
          if (typeof rating === 'number' && rating >= 1 && rating <= 5) {
            // Insert into new normalized ratings table
            await sql`
              INSERT INTO ratings (slug, user_hash, rating, created_at)
              VALUES (${row.question_slug}, ${userHash}, ${rating}, NOW())
              ON CONFLICT (slug, user_hash) DO NOTHING
            `;
            migratedCount++;
          }
        }
      }
    } catch (error) {
      console.warn(`  Warning: Failed to migrate ratings for ${row.question_slug}:`, error.message);
    }
  }

  console.log(`✓ Migrated ${migratedCount} individual ratings to normalized structure`);
  return migratedCount;
}

// Migrate search index data to questions table
async function migrateSearchIndexData(sql) {
  console.log('🔍 Migrating search index data to questions table...');
  
  const searchIndexExists = await tableExists(sql, 'search_index');
  if (!searchIndexExists) {
    console.log('  No search_index table found, skipping search migration');
    return 0;
  }

  // Get search index data
  const searchData = await sql`SELECT questions_data FROM search_index ORDER BY last_updated DESC LIMIT 1`;
  
  if (searchData.length === 0) {
    console.log('  No search index data found');
    return 0;
  }

  const questions = searchData[0].questions_data;
  if (!Array.isArray(questions)) {
    console.log('  Invalid search index data format');
    return 0;
  }

  let migratedCount = 0;
  
  for (const question of questions) {
    try {
      // Check if question already exists in questions table
      const existing = await sql`SELECT id FROM questions WHERE slug = ${question.slug}`;
      
      if (existing.length === 0) {
        // Insert question data
        await sql`
          INSERT INTO questions (
            slug, question, short_answer, content, tags, difficulty, 
            pub_date, updated_date, hero_image
          ) VALUES (
            ${question.slug},
            ${question.question || question.title || ''},
            ${question.shortAnswer || question.short_answer || ''},
            ${question.content || ''},
            ${Array.isArray(question.tags) ? question.tags : []},
            ${question.difficulty || 'easy'},
            ${question.pubDate ? new Date(question.pubDate) : new Date()},
            ${question.updatedDate ? new Date(question.updatedDate) : null},
            ${question.heroImage || null}
          )
        `;
        migratedCount++;
      }
    } catch (error) {
      console.warn(`  Warning: Failed to migrate question ${question.slug}:`, error.message);
    }
  }

  console.log(`✓ Migrated ${migratedCount} questions from search index`);
  return migratedCount;
}

// Update rating aggregates in questions table
async function updateRatingAggregates(sql) {
  console.log('🔄 Updating rating aggregates in questions table...');
  
  const result = await sql`
    UPDATE questions q SET
      rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = q.slug),
      rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = q.slug),
      updated_at = NOW()
    WHERE EXISTS (SELECT 1 FROM ratings WHERE slug = q.slug)
  `;

  console.log(`✓ Updated rating aggregates for questions`);
  return result.count || 0;
}

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content: content };
  }
  
  const frontmatterText = match[1];
  const bodyContent = match[2];
  
  // Simple YAML parser
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      let value = valueParts.join(':').trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''))
          .filter(item => item);
      }
      
      frontmatter[key.trim()] = value;
    }
  }
  
  return { frontmatter, content: bodyContent };
}

// Migrate markdown content to questions table
async function migrateMarkdownContent(sql) {
  console.log('📖 Migrating markdown content to questions table...');
  
  try {
    const qaDir = path.join(process.cwd(), 'src', 'content', 'qa');
    const files = await fs.readdir(qaDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== '.gitkeep');
    
    console.log(`  Found ${markdownFiles.length} markdown files`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const file of markdownFiles) {
      const filePath = path.join(qaDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, content: bodyContent } = parseFrontmatter(content);
      
      if (!frontmatter.question || !frontmatter.shortAnswer) {
        console.log(`  ⚠️  Skipping ${file}: Missing required fields`);
        skippedCount++;
        continue;
      }
      
      const slug = path.basename(file, '.md');
      
      // Check if already exists
      const existing = await sql`SELECT id FROM questions WHERE slug = ${slug}`;
      
      if (existing.length > 0) {
        skippedCount++;
        continue;
      }
      
      // Insert into database
      try {
        await sql`
          INSERT INTO questions (
            slug, question, short_answer, content, tags, difficulty, 
            pub_date, updated_date, hero_image
          ) VALUES (
            ${slug},
            ${frontmatter.question},
            ${frontmatter.shortAnswer},
            ${bodyContent},
            ${Array.isArray(frontmatter.tags) ? frontmatter.tags : []},
            ${frontmatter.difficulty || 'easy'},
            ${frontmatter.pubDate ? new Date(frontmatter.pubDate) : new Date()},
            ${frontmatter.updatedDate ? new Date(frontmatter.updatedDate) : null},
            ${frontmatter.heroImage || null}
          )
        `;
        
        migratedCount++;
      } catch (error) {
        console.warn(`  Warning: Failed to migrate ${file}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`✓ Migrated ${migratedCount} questions from markdown files`);
    console.log(`  Skipped ${skippedCount} files (already exist or invalid)`);
    
    return migratedCount;
    
  } catch (error) {
    console.warn('  Warning: Could not access markdown files:', error.message);
    return 0;
  }
}

// Clean up old tables after successful migration
async function cleanupOldTables(sql, dryRun = true) {
  console.log(`🧹 ${dryRun ? 'Checking' : 'Cleaning up'} old table structures...`);
  
  const oldTables = ['search_index'];
  let cleanedCount = 0;
  
  for (const tableName of oldTables) {
    const exists = await tableExists(sql, tableName);
    if (exists) {
      if (dryRun) {
        console.log(`  Found old table: ${tableName} (would be dropped)`);
      } else {
        await sql`DROP TABLE ${sql(tableName)} CASCADE`;
        console.log(`✓ Dropped old table: ${tableName}`);
        cleanedCount++;
      }
    }
  }
  
  // Check for old ratings table structure
  const ratingsExists = await tableExists(sql, 'ratings');
  if (ratingsExists) {
    const oldStructure = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ratings' AND column_name = 'ratings_data'
    `;
    
    if (oldStructure.length > 0) {
      if (dryRun) {
        console.log('  Found old ratings table structure (would be updated)');
      } else {
        // Rename old table and create new one
        await sql`ALTER TABLE ratings RENAME TO ratings_old`;
        console.log('✓ Renamed old ratings table to ratings_old');
        cleanedCount++;
      }
    }
  }
  
  return cleanedCount;
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting unified schema migration...\n');
  
  try {
    const sql = createDatabaseConnection();
    await testConnection(sql);
    
    // Check if unified schema tables exist
    const questionsExists = await tableExists(sql, 'questions');
    const newRatingsExists = await tableExists(sql, 'ratings');
    
    if (!questionsExists || !newRatingsExists) {
      console.error('❌ Unified schema tables not found. Run setup-neon-db.mjs first.');
      process.exit(1);
    }
    
    console.log('✅ Unified schema tables found\n');
    
    // Run migrations
    const ratingsCount = await migrateRatingsData(sql);
    const searchCount = await migrateSearchIndexData(sql);
    const markdownCount = await migrateMarkdownContent(sql);
    
    // Update rating aggregates
    await updateRatingAggregates(sql);
    
    // Show cleanup preview
    await cleanupOldTables(sql, true);
    
    // Final status
    const finalQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
    const finalRatings = await sql`SELECT COUNT(*) as count FROM ratings`;
    
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Migrated ${ratingsCount} individual ratings`);
    console.log(`  ✅ Migrated ${searchCount} questions from search index`);
    console.log(`  ✅ Migrated ${markdownCount} questions from markdown`);
    console.log(`\n📋 Final Database Status:`);
    console.log(`  Questions: ${finalQuestions[0].count} records`);
    console.log(`  Ratings: ${finalRatings[0].count} records`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test your application with the unified schema');
    console.log('2. Run this script with --cleanup flag to remove old tables');
    console.log('3. Update your application code to use the new API endpoints');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure DATABASE_URL is set correctly');
    console.log('2. Ensure unified schema is set up (run setup-neon-db.mjs)');
    console.log('3. Check database permissions and connectivity');
    process.exit(1);
  }
}

// Handle cleanup flag
if (process.argv.includes('--cleanup')) {
  console.log('🧹 Running cleanup mode...\n');
  
  const sql = createDatabaseConnection();
  await testConnection(sql);
  await cleanupOldTables(sql, false);
  
  console.log('\n✅ Cleanup completed!');
} else {
  runMigration();
}