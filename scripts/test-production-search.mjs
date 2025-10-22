#!/usr/bin/env node

/**
 * Test production search functionality
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testProductionSearch() {
  try {
    console.log('🔍 Testing Production Search...\n');
    
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  DATABASE_URL not set, testing file-based search fallback...');
      
      // Test file-based search
      const { searchQuestions } = await import('../src/lib/search.js');
      
      const result = await searchQuestions({ query: 'astro', limit: 3 });
      console.log(`✅ File-based search: Found ${result.questions.length} results`);
      
      if (result.questions.length > 0) {
        console.log(`   Sample: ${result.questions[0].question}`);
      }
      
      return;
    }
    
    console.log('🗄️  Testing database search...');
    
    // Test database search directly
    const { searchQuestions: dbSearch } = await import('../src/lib/database.js');
    
    // Test 1: Simple search
    console.log('1️⃣ Testing simple search...');
    const result1 = await dbSearch({ query: 'astro', limit: 3 });
    console.log(`   Found ${result1.questions.length} results`);
    
    // Test 2: No filters
    console.log('\n2️⃣ Testing no filters...');
    const result2 = await dbSearch({ limit: 3 });
    console.log(`   Found ${result2.questions.length} results`);
    
    // Test 3: Tag filter
    console.log('\n3️⃣ Testing tag filter...');
    const result3 = await dbSearch({ tags: ['seo'], limit: 3 });
    console.log(`   Found ${result3.questions.length} results`);
    
    // Test 4: Hybrid search (should use database)
    console.log('\n4️⃣ Testing hybrid search...');
    const { searchQuestions } = await import('../src/lib/search.js');
    const result4 = await searchQuestions({ query: 'مواقع', limit: 3 });
    console.log(`   Found ${result4.questions.length} results`);
    
    if (result4.questions.length > 0) {
      console.log(`   Sample: ${result4.questions[0].question}`);
    }
    
    console.log('\n🎉 Production search tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing production search:', error);
    process.exit(1);
  }
}

testProductionSearch();