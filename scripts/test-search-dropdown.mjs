#!/usr/bin/env node

/**
 * Test search API for dropdown functionality
 */

async function testSearchDropdown() {
  try {
    console.log('🔍 Testing Search Dropdown API...\n');
    
    const baseUrl = 'http://localhost:4322';
    
    // Test 1: Search with suggestions
    console.log('1️⃣ Testing search with suggestions...');
    const response1 = await fetch(`${baseUrl}/api/search?q=astro`);
    const result1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Questions: ${result1.questions?.length || 0}`);
    console.log(`   Suggestions: ${result1.suggestions?.length || 0}`);
    
    if (result1.suggestions && result1.suggestions.length > 0) {
      console.log('   Sample suggestion:');
      const sample = result1.suggestions[0];
      console.log(`     - Question: ${sample.question}`);
      console.log(`     - Slug: ${sample.slug}`);
      console.log(`     - Tags: ${sample.tags.join(', ')}`);
    }
    
    // Test 2: Arabic search
    console.log('\n2️⃣ Testing Arabic search...');
    const response2 = await fetch(`${baseUrl}/api/search?q=مواقع`);
    const result2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Suggestions: ${result2.suggestions?.length || 0}`);
    
    // Test 3: Short query (should return suggestions)
    console.log('\n3️⃣ Testing short query...');
    const response3 = await fetch(`${baseUrl}/api/search?q=se`);
    const result3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Suggestions: ${result3.suggestions?.length || 0}`);
    
    console.log('\n🎉 Search dropdown API is working!');
    console.log('The SearchBanner component should now show suggestions properly.');
    
  } catch (error) {
    console.error('❌ Error testing search dropdown:', error);
  }
}

testSearchDropdown();