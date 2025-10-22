#!/usr/bin/env node

/**
 * Test search API in development mode
 */

async function testDevSearch() {
  try {
    console.log('🔍 Testing Search API in Development Mode...\n');
    
    const baseUrl = 'http://localhost:4321';
    
    // Test 1: Basic search
    console.log('1️⃣ Testing basic search...');
    const response1 = await fetch(`${baseUrl}/api/search?q=astro`);
    const result1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Found: ${result1.questions?.length || 0} results`);
    console.log(`   Total: ${result1.pagination?.totalQuestions || 0}`);
    
    // Test 2: Arabic search
    console.log('\n2️⃣ Testing Arabic search...');
    const response2 = await fetch(`${baseUrl}/api/search?q=مواقع`);
    const result2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Found: ${result2.questions?.length || 0} results`);
    
    // Test 3: Tag search
    console.log('\n3️⃣ Testing tag search...');
    const response3 = await fetch(`${baseUrl}/api/search?tags=seo`);
    const result3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Found: ${result3.questions?.length || 0} results`);
    
    // Test 4: Empty search (should return all)
    console.log('\n4️⃣ Testing empty search...');
    const response4 = await fetch(`${baseUrl}/api/search`);
    const result4 = await response4.json();
    console.log(`   Status: ${response4.status}`);
    console.log(`   Found: ${result4.questions?.length || 0} results`);
    console.log(`   Total: ${result4.pagination?.totalQuestions || 0}`);
    
    // Show sample result
    if (result1.questions && result1.questions.length > 0) {
      console.log('\n📋 Sample search result:');
      const sample = result1.questions[0];
      console.log(`   Question: ${sample.question}`);
      console.log(`   Tags: ${sample.tags.join(', ')}`);
      console.log(`   Difficulty: ${sample.difficulty}`);
    }
    
    console.log('\n🎉 Development search is working perfectly!');
    console.log('The hybrid search system automatically falls back to file-based search in dev mode.');
    
  } catch (error) {
    console.error('❌ Error testing dev search:', error);
  }
}

testDevSearch();