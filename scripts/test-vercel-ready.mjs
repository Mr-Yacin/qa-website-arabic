#!/usr/bin/env node

/**
 * Test that the application is ready for Vercel deployment
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testVercelReadiness() {
  try {
    console.log('🚀 Testing Vercel Deployment Readiness...\n');
    console.log('=' .repeat(60));
    
    const results = {
      database: false,
      contactSave: false,
      searchIndex: false,
      searchAPI: false,
      emailConfig: false
    };
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test 1: Database Connection
    console.log('1️⃣  Testing Database Connection...');
    try {
      await sql`SELECT 1 as test`;
      console.log('   ✅ Database connection successful');
      results.database = true;
    } catch (error) {
      console.log('   ❌ Database connection failed:', error.message);
    }
    
    // Test 2: Contact Save Functionality
    console.log('\n2️⃣  Testing Contact Save Functionality...');
    try {
      const testId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
      await sql`
        INSERT INTO contacts (id, name, email, subject, message, timestamp)
        VALUES (${testId}, 'Test User', 'test@example.com', 'Test Subject', 'Test Message', ${new Date().toISOString()})
      `;
      
      const saved = await sql`SELECT * FROM contacts WHERE id = ${testId}`;
      if (saved.length > 0) {
        console.log('   ✅ Contact save successful');
        results.contactSave = true;
        
        // Clean up
        await sql`DELETE FROM contacts WHERE id = ${testId}`;
      } else {
        console.log('   ❌ Contact save verification failed');
      }
    } catch (error) {
      console.log('   ❌ Contact save failed:', error.message);
    }
    
    // Test 3: Search Vectors in Questions Table
    console.log('\n3️⃣  Testing Search Vectors in Questions Table...');
    try {
      const questionCount = await sql`
        SELECT COUNT(*) as count 
        FROM questions 
        WHERE search_vector IS NOT NULL
      `;
      
      const count = parseInt(questionCount[0].count);
      if (count > 0) {
        console.log(`   ✅ Search vectors found for ${count} questions`);
        results.searchIndex = true;
      } else {
        console.log('   ❌ No search vectors found in questions table');
      }
    } catch (error) {
      console.log('   ❌ Search vector check failed:', error.message);
    }
    
    // Test 4: Search API Logic
    console.log('\n4️⃣  Testing Search API Logic...');
    try {
      const testQuery = 'astro';
      const searchResults = await sql`
        SELECT slug, question, short_answer, tags,
               ts_rank(search_vector, to_tsquery('simple', ${testQuery + ':*'})) as rank
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', ${testQuery + ':*'})
        ORDER BY rank DESC
        LIMIT 5
      `;
      
      if (searchResults.length > 0) {
        console.log(`   ✅ Search API logic working (found ${searchResults.length} results for "${testQuery}")`);
        results.searchAPI = true;
      } else {
        console.log('   ⚠️  Search API logic working but no results found');
        results.searchAPI = true; // Still working, just no matches
      }
    } catch (error) {
      console.log('   ❌ Search API logic test failed:', error.message);
    }
    
    // Test 5: Email Configuration
    console.log('\n5️⃣  Testing Email Configuration...');
    const requiredEnvVars = ['RESEND_API_KEY', 'ADMIN_EMAIL', 'FROM_EMAIL'];
    let emailConfigured = true;
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: configured`);
      } else {
        console.log(`   ❌ ${envVar}: missing`);
        emailConfigured = false;
      }
    }
    
    results.emailConfig = emailConfigured;
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 VERCEL DEPLOYMENT READINESS SUMMARY:');
    console.log('=' .repeat(60));
    
    console.log(`🗄️  Database Connection:     ${results.database ? '✅ READY' : '❌ FAILED'}`);
    console.log(`📧 Contact Save:            ${results.contactSave ? '✅ READY' : '❌ FAILED'}`);
    console.log(`🔍 Search Index:            ${results.searchIndex ? '✅ READY' : '❌ FAILED'}`);
    console.log(`🔎 Search API:              ${results.searchAPI ? '✅ READY' : '❌ FAILED'}`);
    console.log(`📨 Email Config:            ${results.emailConfig ? '✅ READY' : '⚠️  PARTIAL'}`);
    
    const criticalTests = [results.database, results.contactSave, results.searchIndex, results.searchAPI];
    const allCriticalPassed = criticalTests.every(test => test);
    
    console.log('\n' + '=' .repeat(60));
    if (allCriticalPassed) {
      console.log('🎉 DEPLOYMENT STATUS: ✅ READY FOR VERCEL');
      console.log('');
      console.log('✨ All critical functionality is working:');
      console.log('   • Contact forms will save to Neon database');
      console.log('   • Search will work without file system dependencies');
      console.log('   • No ENOENT errors expected on Vercel');
      console.log('');
      console.log('🚀 You can safely deploy to Vercel!');
    } else {
      console.log('⚠️  DEPLOYMENT STATUS: ❌ ISSUES FOUND');
      console.log('');
      console.log('Please fix the failed tests before deploying to Vercel.');
    }
    
    return allCriticalPassed;
    
  } catch (error) {
    console.error('❌ Vercel readiness test failed:', error);
    return false;
  }
}

testVercelReadiness()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });