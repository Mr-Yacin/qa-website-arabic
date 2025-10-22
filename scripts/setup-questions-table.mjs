#!/usr/bin/env node

/**
 * Setup optimized questions table for full-text search
 * Designed for 500+ questions with Arabic content
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupQuestionsTable() {
  try {
    console.log('🏗️  Setting up optimized questions table for full-text search...\n');
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Create questions table with proper indexing
    console.log('📋 Creating questions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        question TEXT NOT NULL,
        short_answer TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        difficulty TEXT DEFAULT 'easy',
        pub_date TIMESTAMP WITH TIME ZONE NOT NULL,
        updated_date TIMESTAMP WITH TIME ZONE,
        hero_image TEXT,
        rating_sum INTEGER DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        rating_avg DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        search_vector tsvector
      )
    `;
    
    // Create function to update search vector
    console.log('🔍 Creating search vector update function...');
    await sql`
      CREATE OR REPLACE FUNCTION update_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('simple', NEW.question), 'A') ||
          setweight(to_tsvector('simple', NEW.short_answer), 'B') ||
          setweight(to_tsvector('simple', NEW.content), 'C') ||
          setweight(to_tsvector('simple', array_to_string(NEW.tags, ' ')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Create trigger for search vector updates
    await sql`
      DROP TRIGGER IF EXISTS update_questions_search_vector ON questions;
    `;
    
    await sql`
      CREATE TRIGGER update_questions_search_vector
        BEFORE INSERT OR UPDATE ON questions
        FOR EACH ROW
        EXECUTE FUNCTION update_search_vector();
    `;
    
    // Create indexes for performance
    console.log('🔍 Creating search indexes...');
    
    // Full-text search index
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_search 
              ON questions USING GIN(search_vector)`;
    
    // Common query indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_slug 
              ON questions(slug)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_pub_date 
              ON questions(pub_date DESC)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_difficulty 
              ON questions(difficulty)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_rating 
              ON questions(rating_avg DESC, rating_count DESC)`;
    
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_tags 
              ON questions USING GIN(tags)`;
    
    // Create updated_at trigger
    console.log('⚡ Setting up auto-update trigger...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    
    await sql`
      DROP TRIGGER IF EXISTS update_questions_updated_at ON questions
    `;
    
    await sql`
      CREATE TRIGGER update_questions_updated_at
        BEFORE UPDATE ON questions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    
    console.log('✅ Questions table setup completed');
    
    // Show table info
    const tableInfo = await sql`
      SELECT 
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_name = 'questions'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📊 Table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('Ready for 500+ questions with optimized search performance.');
    
  } catch (error) {
    console.error('❌ Error setting up questions table:', error);
    process.exit(1);
  }
}

setupQuestionsTable();