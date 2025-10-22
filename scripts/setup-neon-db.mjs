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
    console.log('Setting up Neon database tables...');

    // Create ratings table
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        question_slug VARCHAR(255) PRIMARY KEY,
        ratings_data JSONB NOT NULL,
        average DECIMAL(3,2) NOT NULL DEFAULT 0,
        count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created ratings table');

    // Create contacts table
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

    // Create search_index table
    await sql`
      CREATE TABLE IF NOT EXISTS search_index (
        id SERIAL PRIMARY KEY,
        questions_data JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ Created search_index table');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_slug ON ratings(question_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_updated ON ratings(last_updated DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_search_updated ON search_index(last_updated DESC)`;
    console.log('✓ Created database indexes');

    // Test the connection and tables
    const ratingsCount = await sql`SELECT COUNT(*) as count FROM ratings`;
    const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`;
    const searchCount = await sql`SELECT COUNT(*) as count FROM search_index`;

    console.log('\n📊 Database Status:');
    console.log(`   Ratings: ${ratingsCount[0].count} records`);
    console.log(`   Contacts: ${contactsCount[0].count} records`);
    console.log(`   Search Index: ${searchCount[0].count} records`);

    console.log('\n🎉 Neon database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run your application with the DATABASE_URL environment variable');
    console.log('2. The application will automatically use Neon for data storage');
    console.log('3. Existing data from KV/filesystem will need to be migrated manually if needed');

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