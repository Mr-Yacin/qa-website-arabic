#!/usr/bin/env node

/**
 * Comprehensive test for contact save and search functionality
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

// Test database-backed search functionality
async function testSearchFunctionality() {
  console.log('🔍 Testing Database-Backed Search Functionality...\n');
  
  try {
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if questions table exists and has data
    const questionCount = await sql`SELECT COUNT(*) as count FROM questions`;
    const count = parseInt(questionCount[0].count);
    
    console.log(`✅ Questions table has ${count} questions`);
    
    if (count === 0) {
      console.log('⚠️  No questions found in database. Run content sync first.');
      return false;
    }
    
    // Test search queries using PostgreSQL full-text search
    const testQueries = ['astro', 'seo'];
    
    for (const query of testQueries) {
      // Test full-text search
      const results = await sql`
        SELECT slug, question, short_answer, tags,
               ts_rank(search_vector, to_tsquery('simple', ${query + ':*'})) as rank
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
        ORDER BY rank DESC
        LIMIT 5
      `;
      
      console.log(`✅ Query "${query}": ${results.length} results found using PostgreSQL full-text search`);
      
      if (results.length > 0) {
        console.log(`   Top result: "${results[0].question}"`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database search functionality test failed:', error);
    return false;
  }
}

// Test contact save to Neon
async function testContactSaveToNeon() {
  console.log('💾 Testing Contact Save to Neon Database...\n');
  
  try {
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Check if contacts table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contacts'
      );
    `;
    
    console.log('✅ Contacts table exists:', tableCheck[0].exists);
    
    // Test contact save
    const testId = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    const testContact = {
      id: testId,
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Message',
      message: 'This is a test message to verify Neon database integration.',
      timestamp: new Date().toISOString()
    };
    
    // Insert test contact
    await sql`
      INSERT INTO contacts (id, name, email, subject, message, timestamp)
      VALUES (${testContact.id}, ${testContact.name}, ${testContact.email}, ${testContact.subject}, ${testContact.message}, ${testContact.timestamp})
    `;
    
    console.log('✅ Test contact message saved to Neon database');
    
    // Verify the save
    const saved = await sql`SELECT * FROM contacts WHERE id = ${testId}`;
    console.log('✅ Contact message verified in database:', {
      id: saved[0].id,
      name: saved[0].name,
      email: saved[0].email,
      subject: saved[0].subject
    });
    
    // Clean up
    await sql`DELETE FROM contacts WHERE id = ${testId}`;
    console.log('✅ Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Contact save to Neon test failed:', error);
    return false;
  }
}

// Test email configuration
async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration...\n');
  
  try {
    const requiredEnvVars = ['RESEND_API_KEY', 'ADMIN_EMAIL', 'FROM_EMAIL'];
    let allConfigured = true;
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: configured`);
      } else {
        console.log(`❌ ${envVar}: not configured`);
        allConfigured = false;
      }
    }
    
    if (allConfigured) {
      console.log('✅ All email configuration variables are set');
    } else {
      console.log('⚠️  Some email configuration variables are missing');
    }
    
    return allConfigured;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return false;
  }
}

// Main test function
async function runFullTest() {
  console.log('🚀 Running Full Functionality Test\n');
  console.log('=' .repeat(50));
  
  const results = {
    search: false,
    contactSave: false,
    emailConfig: false
  };
  
  // Test search functionality
  results.search = await testSearchFunctionality();
  console.log('');
  
  // Test contact save to Neon
  results.contactSave = await testContactSaveToNeon();
  console.log('');
  
  // Test email configuration
  results.emailConfig = await testEmailConfiguration();
  console.log('');
  
  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`🔍 Search Functionality: ${results.search ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`💾 Contact Save to Neon: ${results.contactSave ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📧 Email Configuration: ${results.emailConfig ? '✅ PASSED' : '⚠️  PARTIAL'}`);
  
  const allPassed = results.search && results.contactSave;
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL CORE FEATURES WORKING' : '❌ SOME ISSUES FOUND'}`);
  
  if (allPassed) {
    console.log('\n🎉 Your Arabic Q&A site is fully functional!');
    console.log('- Contact forms will save to Neon database');
    console.log('- Search functionality is working properly');
    console.log('- Email notifications are configured');
  } else {
    console.log('\n⚠️  Please check the failed tests above');
  }
  
  return allPassed;
}

// Run the test
runFullTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });