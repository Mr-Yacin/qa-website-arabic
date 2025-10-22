#!/usr/bin/env node

/**
 * Database health check utility
 * Verifies database connection, schema, and basic functionality
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health...\n');
  
  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    await sql`SELECT 1 as test`;
    console.log('   ✅ Connection successful');
    
    // Check required tables
    console.log('\n2. Checking required tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('questions', 'ratings', 'contacts')
      AND table_schema = 'public'
    `;
    
    const requiredTables = ['questions', 'ratings', 'contacts'];
    const existingTables = tables.map(t => t.table_name);
    
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        console.log(`   ❌ Table '${table}' missing`);
      }
    }
    
    // Check indexes
    console.log('\n3. Checking database indexes...');
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE indexname IN ('idx_questions_tsv', 'idx_questions_slug', 'idx_ratings_slug')
      AND schemaname = 'public'
    `;
    
    const requiredIndexes = ['idx_questions_tsv', 'idx_questions_slug', 'idx_ratings_slug'];
    const existingIndexes = indexes.map(i => i.indexname);
    
    for (const index of requiredIndexes) {
      if (existingIndexes.includes(index)) {
        console.log(`   ✅ Index '${index}' exists`);
      } else {
        console.log(`   ❌ Index '${index}' missing`);
      }
    }
    
    // Check triggers
    console.log('\n4. Checking database triggers...');
    const triggers = await sql`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name = 'trg_update_search_vector'
      AND event_object_table = 'questions'
    `;
    
    if (triggers.length > 0) {
      console.log('   ✅ Search vector update trigger exists');
    } else {
      console.log('   ❌ Search vector update trigger missing');
    }
    
    // Test search functionality
    console.log('\n5. Testing search functionality...');
    try {
      const searchTest = await sql`
        SELECT COUNT(*) as count 
        FROM questions 
        WHERE search_vector IS NOT NULL
      `;
      console.log(`   ✅ Search vectors: ${searchTest[0].count} questions indexed`);
    } catch (error) {
      console.log('   ❌ Search functionality test failed:', error.message);
    }
    
    // Show data counts
    console.log('\n6. Data summary...');
    const questionsCount = await sql`SELECT COUNT(*) as count FROM questions`;
    const ratingsCount = await sql`SELECT COUNT(*) as count FROM ratings`;
    const contactsCount = await sql`SELECT COUNT(*) as count FROM contacts`;
    
    console.log(`   📊 Questions: ${questionsCount[0].count} records`);
    console.log(`   📊 Ratings: ${ratingsCount[0].count} records`);
    console.log(`   📊 Contacts: ${contactsCount[0].count} records`);
    
    // Environment check
    console.log('\n7. Environment configuration...');
    const requiredEnv = ['DATABASE_URL'];
    const optionalEnv = ['HASH_SALT', 'REINDEX_TOKEN'];
    
    for (const env of requiredEnv) {
      if (process.env[env]) {
        console.log(`   ✅ ${env} is set`);
      } else {
        console.log(`   ❌ ${env} is missing (required)`);
      }
    }
    
    for (const env of optionalEnv) {
      if (process.env[env]) {
        console.log(`   ✅ ${env} is set`);
      } else {
        console.log(`   ⚠️  ${env} is missing (recommended)`);
      }
    }
    
    console.log('\n🎉 Database health check completed!');
    
  } catch (error) {
    console.error('\n❌ Database health check failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Verify DATABASE_URL is set correctly');
    console.log('2. Check database connectivity and permissions');
    console.log('3. Run setup-neon-db.mjs to create missing tables/indexes');
    console.log('4. Run migrate-to-unified-schema.mjs to migrate existing data');
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

checkDatabaseHealth();