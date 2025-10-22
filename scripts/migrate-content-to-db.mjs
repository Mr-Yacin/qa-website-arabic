#!/usr/bin/env node

/**
 * Migrate existing content from markdown files to questions table
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

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

async function migrateContentToDatabase() {
  try {
    console.log('📦 Migrating content from markdown files to database...\n');
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if questions table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'questions'
      )
    `;
    
    if (!tableExists[0].exists) {
      console.error('❌ Questions table does not exist. Run setup-questions-table.mjs first.');
      process.exit(1);
    }
    
    // Read markdown files
    const qaDir = path.join(process.cwd(), 'src', 'content', 'qa');
    const files = await fs.readdir(qaDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== '.gitkeep');
    
    console.log(`📖 Found ${markdownFiles.length} markdown files to migrate`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const file of markdownFiles) {
      const filePath = path.join(qaDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, content: bodyContent } = parseFrontmatter(content);
      
      if (!frontmatter.question || !frontmatter.shortAnswer) {
        console.log(`⚠️  Skipping ${file}: Missing required fields`);
        skippedCount++;
        continue;
      }
      
      const slug = path.basename(file, '.md');
      
      // Check if already exists
      const existing = await sql`
        SELECT id FROM questions WHERE slug = ${slug}
      `;
      
      if (existing.length > 0) {
        console.log(`⚠️  Skipping ${file}: Already exists in database`);
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
        
        console.log(`✅ Migrated: ${frontmatter.question}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${file}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✅ Migrated: ${migratedCount} questions`);
    console.log(`  ⚠️  Skipped: ${skippedCount} questions`);
    
    // Show final count
    const totalQuestions = await sql`SELECT COUNT(*) as count FROM questions`;
    console.log(`  📋 Total in database: ${totalQuestions[0].count} questions`);
    
    console.log('\n🎉 Content migration completed!');
    
  } catch (error) {
    console.error('❌ Error migrating content:', error);
    process.exit(1);
  }
}

migrateContentToDatabase();