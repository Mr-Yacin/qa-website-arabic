#!/usr/bin/env node

/**
 * Manual content synchronization script
 * Syncs markdown content from Astro content collections to database
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

config({ path: join(projectRoot, '.env') });

async function syncContent() {
  try {
    console.log('🔄 Starting content synchronization...');
    
    // Validate environment
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is required');
      process.exit(1);
    }

    // Dynamic imports to handle ES modules
    const { createDatabaseConnection, testDatabaseConnection } = await import('../src/lib/database.js');
    const { syncContentCollection, validateContentCollection, getDatabaseStats } = await import('../src/lib/contentSync.js');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const sql = createDatabaseConnection();
    const isConnected = await testDatabaseConnection(sql);
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    console.log('✅ Database connection successful');

    // Load content collection (this requires a more complex setup for standalone scripts)
    console.log('📚 Loading content collection...');
    
    // For now, we'll use a simpler approach - call the API endpoint
    const reindexUrl = process.env.SITE_URL 
      ? `${process.env.SITE_URL}/api/reindex`
      : 'http://localhost:4321/api/reindex';
    
    const token = process.env.REINDEX_TOKEN;
    if (!token) {
      console.error('❌ REINDEX_TOKEN environment variable is required');
      process.exit(1);
    }

    console.log(`🌐 Calling reindex API at ${reindexUrl}...`);
    
    const response = await fetch(reindexUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Reindex API failed:', result.message);
      if (result.error) {
        console.error('Error details:', result.error);
      }
      process.exit(1);
    }

    // Display results
    console.log('\n📊 Synchronization Results:');
    console.log(`✅ Processed: ${result.processed}`);
    console.log(`❌ Errors: ${result.errors}`);
    console.log(`📝 Total: ${result.total}`);
    
    if (result.statistics) {
      console.log('\n📈 Database Statistics:');
      console.log(`📚 Total questions in DB: ${result.statistics.totalQuestionsInDb}`);
      console.log(`⭐ Questions with ratings: ${result.statistics.questionsWithRatings}`);
      console.log(`🎯 Total ratings: ${result.statistics.totalRatings}`);
      if (result.statistics.lastUpdated) {
        console.log(`🕒 Last updated: ${new Date(result.statistics.lastUpdated).toLocaleString()}`);
      }
    }

    if (result.validation?.hasIssues) {
      console.log(`\n⚠️  Validation issues found: ${result.validation.issueCount}`);
      if (result.validationErrors) {
        console.log('Validation errors:');
        result.validationErrors.forEach(error => {
          console.log(`  - ${error.slug}: ${error.issues.join(', ')}`);
        });
      }
    }

    if (result.errors > 0 && result.errorDetails) {
      console.log('\n❌ Error details:');
      result.errorDetails.forEach(error => {
        console.log(`  - ${error.slug}: ${error.error}`);
      });
    }

    console.log(`\n${result.message}`);
    console.log('🎉 Content synchronization completed!');

  } catch (error) {
    console.error('❌ Synchronization failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Alternative direct sync function (for when API is not available)
async function directSync() {
  try {
    console.log('🔄 Starting direct content synchronization...');
    
    // This would require setting up Astro's content collection system
    // For now, we'll recommend using the API approach
    console.log('ℹ️  Direct sync requires Astro runtime. Use API sync instead.');
    console.log('ℹ️  Run: npm run dev (in another terminal) then run this script again');
    
  } catch (error) {
    console.error('❌ Direct sync failed:', error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);
const isDirect = args.includes('--direct');

if (isDirect) {
  await directSync();
} else {
  await syncContent();
}