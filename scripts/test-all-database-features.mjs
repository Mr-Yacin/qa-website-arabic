#!/usr/bin/env node

/**
 * Comprehensive test suite for Arabic Q&A database enhancements
 * Tests all aspects of the unified database-first architecture
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

function runTest(scriptName, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${description}...`);
    console.log('=' .repeat(60));
    
    const child = spawn('node', [scriptName], {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} - PASSED`);
        resolve(true);
      } else {
        console.log(`❌ ${description} - FAILED`);
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ ${description} - ERROR:`, error.message);
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('🚀 Arabic Q&A Database Enhancement Test Suite');
  console.log('Testing unified database-first architecture...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.log('Please set your Neon database connection string in .env.local');
    process.exit(1);
  }
  
  const tests = [
    {
      script: 'scripts/test-database-schema.mjs',
      description: 'Database Schema and Operations'
    },
    {
      script: 'scripts/test-api-endpoints.mjs', 
      description: 'API Endpoints with Database Backend'
    },
    {
      script: 'scripts/test-data-model-consistency.mjs',
      description: 'Data Model Consistency'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await runTest(test.script, test.description);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The unified database architecture is working correctly.');
    console.log('\n📋 What was tested:');
    console.log('   ✓ Database schema with proper constraints and indexes');
    console.log('   ✓ Rating UPSERT operations and aggregate calculations');
    console.log('   ✓ Automatic search vector generation via database triggers');
    console.log('   ✓ Foreign key constraints and CASCADE DELETE behavior');
    console.log('   ✓ Rating API with normalized database tables');
    console.log('   ✓ Search API with properly ranked results and pagination');
    console.log('   ✓ Content reindexing API for markdown synchronization');
    console.log('   ✓ Search performance with GIN indexes');
    console.log('   ✓ Data model consistency across the application');
    console.log('   ✓ Concurrent rating submissions and aggregate consistency');
    console.log('   ✓ Data integrity constraints and validation');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Deploy the application with the unified database schema');
    console.log('   2. Run the /api/reindex endpoint to sync existing content');
    console.log('   3. Configure GitHub secrets for automatic content sync:');
    console.log('      - SITE_URL: Your deployed site URL');
    console.log('      - REINDEX_TOKEN: Token for /api/reindex authentication');
    console.log('   4. Test the GitHub Action by pushing content changes');
    
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please review the output above and fix any issues.');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite execution failed:', error);
  process.exit(1);
});