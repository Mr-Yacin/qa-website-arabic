#!/usr/bin/env node

/**
 * Migrate search index from file to Neon database
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

async function migrateSearchIndexToNeon() {
  try {
    console.log('🔄 Migrating Search Index to Neon Database...\n');
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Load search index from file
    console.log('📖 Loading search index from file...');
    const indexPath = path.join(process.cwd(), 'data', 'search-index.json');
    
    let searchIndexData;
    try {
      const data = await fs.readFile(indexPath, 'utf-8');
      searchIndexData = JSON.parse(data);
      console.log(`✅ Loaded search index with ${searchIndexData.questions.length} questions`);
    } catch (error) {
      console.error('❌ Failed to load search index file:', error);
      console.log('ℹ️  Creating empty search index...');
      searchIndexData = {
        questions: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Ensure search_index table exists
    console.log('🏗️  Ensuring search_index table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS search_index (
        id SERIAL PRIMARY KEY,
        questions_data JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_search_updated ON search_index(last_updated DESC)`;
    console.log('✅ Search index table ready');
    
    // Insert search index data
    console.log('💾 Saving search index to Neon database...');
    await sql`
      INSERT INTO search_index (questions_data, last_updated)
      VALUES (${JSON.stringify(searchIndexData.questions)}, ${searchIndexData.lastUpdated})
    `;
    
    // Keep only the latest 5 search index entries
    await sql`
      DELETE FROM search_index 
      WHERE id NOT IN (
        SELECT id FROM search_index 
        ORDER BY last_updated DESC 
        LIMIT 5
      )
    `;
    
    console.log('✅ Search index saved to Neon database');
    
    // Verify the migration
    const [savedIndex] = await sql`
      SELECT questions_data, last_updated 
      FROM search_index 
      ORDER BY last_updated DESC 
      LIMIT 1
    `;
    
    if (savedIndex) {
      const questionsCount = Array.isArray(savedIndex.questions_data) ? savedIndex.questions_data.length : 0;
      console.log(`✅ Verified: ${questionsCount} questions in database`);
      console.log(`✅ Last updated: ${savedIndex.last_updated}`);
    }
    
    console.log('\n🎉 Search index migration completed successfully!');
    console.log('The search API will now use the Neon database instead of the file system.');
    
  } catch (error) {
    console.error('❌ Error migrating search index:', error);
    process.exit(1);
  }
}

migrateSearchIndexToNeon();