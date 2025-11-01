#!/usr/bin/env node

/**
 * Migrate data from Vercel KV to Neon database
 * This script helps migrate existing ratings, contacts, and search index data
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL);

async function migrateFromKV() {
  console.log('🔄 Starting migration from Vercel KV to Neon...');

  try {
    // Check if we have KV credentials
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log('⚠️  KV credentials not found, skipping KV migration');
      return false;
    }

    const { kv } = await import('@vercel/kv');

    // Migrate ratings
    console.log('📊 Migrating ratings data...');
    const ratingsData = await kv.get('ratings');
    if (ratingsData && typeof ratingsData === 'object') {
      let migratedRatings = 0;
      
      for (const [slug, ratingInfo] of Object.entries(ratingsData)) {
        await sql`
          INSERT INTO ratings (question_slug, ratings_data, average, count, last_updated)
          VALUES (${slug}, ${JSON.stringify(ratingInfo.ratings)}, ${ratingInfo.average}, ${ratingInfo.count}, ${ratingInfo.lastUpdated})
          ON CONFLICT (question_slug) 
          DO UPDATE SET 
            ratings_data = EXCLUDED.ratings_data,
            average = EXCLUDED.average,
            count = EXCLUDED.count,
            last_updated = EXCLUDED.last_updated
        `;
        migratedRatings++;
      }
      
      console.log(`✓ Migrated ${migratedRatings} rating records`);
    } else {
      console.log('  No ratings data found in KV');
    }

    // Migrate contacts
    console.log('📧 Migrating contacts data...');
    const contactsData = await kv.get('contacts');
    if (contactsData && contactsData.messages) {
      let migratedContacts = 0;
      
      for (const message of contactsData.messages) {
        try {
          await sql`
            INSERT INTO contacts (id, name, email, subject, message, timestamp)
            VALUES (${message.id}, ${message.name}, ${message.email}, ${message.subject}, ${message.message}, ${message.timestamp})
            ON CONFLICT (id) DO NOTHING
          `;
          migratedContacts++;
        } catch (error) {
          console.warn(`  Warning: Failed to migrate contact ${message.id}:`, error.message);
        }
      }
      
      console.log(`✓ Migrated ${migratedContacts} contact records`);
    } else {
      console.log('  No contacts data found in KV');
    }

    // Migrate search index
    console.log('🔍 Migrating search index...');
    const searchIndexData = await kv.get('searchIndex');
    if (searchIndexData && searchIndexData.questions) {
      await sql`
        INSERT INTO search_index (questions_data, last_updated)
        VALUES (${JSON.stringify(searchIndexData.questions)}, ${searchIndexData.lastUpdated || new Date().toISOString()})
      `;
      
      console.log(`✓ Migrated search index with ${searchIndexData.questions.length} questions`);
    } else {
      console.log('  No search index data found in KV');
    }

    return true;

  } catch (error) {
    console.error('❌ Error migrating from KV:', error);
    return false;
  }
}

async function migrateFromFileSystem() {
  console.log('📁 Checking for filesystem data...');

  try {
    const dataDir = 'data';
    
    // Check if data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      console.log('  No data directory found, skipping filesystem migration');
      return false;
    }

    let migratedFiles = 0;

    // Migrate ratings.json
    try {
      const ratingsPath = path.join(dataDir, 'ratings.json');
      const ratingsContent = await fs.readFile(ratingsPath, 'utf-8');
      const ratingsData = JSON.parse(ratingsContent);
      
      let migratedRatings = 0;
      for (const [slug, ratingInfo] of Object.entries(ratingsData)) {
        await sql`
          INSERT INTO ratings (question_slug, ratings_data, average, count, last_updated)
          VALUES (${slug}, ${JSON.stringify(ratingInfo.ratings)}, ${ratingInfo.average}, ${ratingInfo.count}, ${ratingInfo.lastUpdated})
          ON CONFLICT (question_slug) 
          DO UPDATE SET 
            ratings_data = EXCLUDED.ratings_data,
            average = EXCLUDED.average,
            count = EXCLUDED.count,
            last_updated = EXCLUDED.last_updated
        `;
        migratedRatings++;
      }
      
      console.log(`✓ Migrated ${migratedRatings} rating records from filesystem`);
      migratedFiles++;
    } catch (error) {
      console.log('  No ratings.json found or failed to migrate');
    }

    // Migrate contacts.json
    try {
      const contactsPath = path.join(dataDir, 'contacts.json');
      const contactsContent = await fs.readFile(contactsPath, 'utf-8');
      const contactsData = JSON.parse(contactsContent);
      
      let migratedContacts = 0;
      for (const message of contactsData.messages || []) {
        try {
          await sql`
            INSERT INTO contacts (id, name, email, subject, message, timestamp)
            VALUES (${message.id}, ${message.name}, ${message.email}, ${message.subject}, ${message.message}, ${message.timestamp})
            ON CONFLICT (id) DO NOTHING
          `;
          migratedContacts++;
        } catch (error) {
          console.warn(`  Warning: Failed to migrate contact ${message.id}:`, error.message);
        }
      }
      
      console.log(`✓ Migrated ${migratedContacts} contact records from filesystem`);
      migratedFiles++;
    } catch (error) {
      console.log('  No contacts.json found or failed to migrate');
    }

    // Migrate searchIndex.json
    try {
      const searchPath = path.join(dataDir, 'searchIndex.json');
      const searchContent = await fs.readFile(searchPath, 'utf-8');
      const searchData = JSON.parse(searchContent);
      
      await sql`
        INSERT INTO search_index (questions_data, last_updated)
        VALUES (${JSON.stringify(searchData.questions)}, ${searchData.lastUpdated || new Date().toISOString()})
      `;
      
      console.log(`✓ Migrated search index with ${searchData.questions.length} questions from filesystem`);
      migratedFiles++;
    } catch (error) {
      console.log('  No searchIndex.json found or failed to migrate');
    }

    return migratedFiles > 0;

  } catch (error) {
    console.error('❌ Error migrating from filesystem:', error);
    return false;
  }
}

async function runMigration() {
  // Check if DATABASE_URL is provided
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('\nPlease set your Neon database connection string:');
    console.log('export DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require"');
    process.exit(1);
  }

  try {
    // Ensure tables exist
    console.log('🔧 Setting up database tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        question_slug VARCHAR(255) PRIMARY KEY,
        ratings_data JSONB NOT NULL,
        average DECIMAL(3,2) NOT NULL DEFAULT 0,
        count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

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

    await sql`
      CREATE TABLE IF NOT EXISTS search_index (
        id SERIAL PRIMARY KEY,
        questions_data JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Try KV migration first
    const kvMigrated = await migrateFromKV();
    
    // Try filesystem migration if KV didn't work
    const fsMigrated = await migrateFromFileSystem();

    if (kvMigrated || fsMigrated) {
      console.log('\n🎉 Migration completed successfully!');
      
      // Show final counts
      const ratingsCount = await sql`SELECT COUNT(*) as count FROM ratings`;
      const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`;
      const searchCount = await sql`SELECT COUNT(*) as count FROM search_index`;

      console.log('\n📊 Final Database Status:');
      console.log(`   Ratings: ${ratingsCount[0].count} records`);
      console.log(`   Contacts: ${contactsCount[0].count} records`);
      console.log(`   Search Index: ${searchCount[0].count} records`);
    } else {
      console.log('\n⚠️  No data found to migrate');
      console.log('This is normal for new installations or if data was already migrated');
    }

    console.log('\n✅ Your application is now ready to use Neon database!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();