#!/usr/bin/env node

/**
 * Setup Neon database tables and indexes
 * Run this script after setting up your Neon database
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('Setting up unified Neon database schema...');

    // Create questions table with search vectors and rating aggregates
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        question TEXT NOT NULL,
        short_answer TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] NOT NULL,
        difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) NOT NULL DEFAULT 'easy',
        pub_date DATE NOT NULL,
        updated_date DATE,
        hero_image TEXT,
        
        -- Rating aggregates (computed from ratings table)
        rating_sum INT NOT NULL DEFAULT 0,
        rating_count INT NOT NULL DEFAULT 0,
        rating_avg NUMERIC(3,2) GENERATED ALWAYS AS 
          (CASE WHEN rating_count > 0 THEN ROUND(rating_sum::numeric / rating_count, 2) ELSE 0 END) STORED,
        
        -- Full-text search vector
        search_vector TSVECTOR,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✓ Created unified questions table');

    // Create normalized ratings table
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        slug TEXT NOT NULL,
        user_hash TEXT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (slug, user_hash)
      )
    `;
    console.log('✓ Created normalized ratings table');

    // Add foreign key constraint if it doesn't exist
    try {
      await sql`
        ALTER TABLE ratings 
        ADD CONSTRAINT fk_ratings_question 
        FOREIGN KEY (slug) REFERENCES questions(slug) ON DELETE CASCADE
      `;
      console.log('✓ Added foreign key constraint');
    } catch (error) {
      if (error.code !== '42710') { // Constraint already exists
        throw error;
      }
      console.log('✓ Foreign key constraint already exists');
    }

    // Create contacts table (keeping existing functionality)
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created contacts table');

    // Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_tsv ON questions USING GIN (search_vector)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_pub ON questions(pub_date DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_tags ON questions USING GIN (tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_slug ON ratings(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`;
    console.log('✓ Created database indexes including GIN index for search vectors');

    // Create automatic search vector update trigger
    await sql`
      CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple',
          coalesce(NEW.question,'') || ' ' ||
          coalesce(NEW.short_answer,'') || ' ' ||
          coalesce(NEW.content,'')
        );
        NEW.updated_at := NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    await sql`
      DROP TRIGGER IF EXISTS trg_update_search_vector ON questions
    `;

    await sql`
      CREATE TRIGGER trg_update_search_vector
        BEFORE INSERT OR UPDATE ON questions
        FOR EACH ROW EXECUTE PROCEDURE update_search_vector()
    `;
    console.log('✓ Created automatic search vector update trigger');

    // Test the connection and tables
    const questionsCount = await sql`SELECT COUNT(*) as count FROM questions`;
    const ratingsCount = await sql`SELECT COUNT(*) as count FROM ratings`;
    const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`;

    console.log('\n📊 Database Status:');
    console.log(`   Questions: ${questionsCount[0].count} records`);
    console.log(`   Ratings: ${ratingsCount[0].count} records`);
    console.log(`   Contacts: ${contactsCount[0].count} records`);

    console.log('\n🎉 Unified database schema setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run your application with the DATABASE_URL environment variable');
    console.log('2. Use the /api/reindex endpoint to sync markdown content to database');
    console.log('3. The application will use unified database schema for all operations');
    console.log('4. Search vectors will be automatically maintained via database triggers');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure DATABASE_URL is set in your environment');
    console.log('2. Verify your Neon database is accessible');
    console.log('3. Check that your connection string includes ?sslmode=require');
    process.exit(1);
  }
}

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('\nPlease set your Neon database connection string:');
  console.log('export DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require"');
  process.exit(1);
}

setupDatabase();