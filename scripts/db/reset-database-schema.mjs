#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetDatabaseSchema() {
  try {
    console.log('🔄 Resetting database schema...\n');
    
    // Drop existing tables in correct order (ratings first due to foreign key)
    console.log('Dropping old tables...');
    await sql`DROP TABLE IF EXISTS ratings CASCADE`;
    await sql`DROP TABLE IF EXISTS search_index CASCADE`;
    await sql`DROP TABLE IF EXISTS questions CASCADE`;
    console.log('✓ Dropped old tables');
    
    // Create questions table with unified schema
    await sql`
      CREATE TABLE questions (
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
      CREATE TABLE ratings (
        slug TEXT NOT NULL,
        user_hash TEXT NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (slug, user_hash),
        CONSTRAINT fk_ratings_question FOREIGN KEY (slug) REFERENCES questions(slug) ON DELETE CASCADE
      )
    `;
    console.log('✓ Created normalized ratings table');

    // Create indexes for performance
    await sql`CREATE INDEX idx_questions_tsv ON questions USING GIN (search_vector)`;
    await sql`CREATE INDEX idx_questions_slug ON questions(slug)`;
    await sql`CREATE INDEX idx_questions_pub ON questions(pub_date DESC)`;
    await sql`CREATE INDEX idx_questions_tags ON questions USING GIN (tags)`;
    await sql`CREATE INDEX idx_ratings_slug ON ratings(slug)`;
    console.log('✓ Created database indexes');

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
      CREATE TRIGGER trg_update_search_vector
        BEFORE INSERT OR UPDATE ON questions
        FOR EACH ROW EXECUTE PROCEDURE update_search_vector()
    `;
    console.log('✓ Created automatic search vector update trigger');

    console.log('\n🎉 Database schema reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting database schema:', error);
    process.exit(1);
  }
}

resetDatabaseSchema();