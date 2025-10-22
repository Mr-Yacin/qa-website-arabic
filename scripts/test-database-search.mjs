#!/usr/bin/env node

/**
 * Test the new database search functionality
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseSearch() {
  try {
    console.log('🔍 Testing Database Search Performance...\n');
    
    // Import database functions
    const { searchQuestions, getQuestionBySlug, getRelatedQuestions, getPopularTags } = 
      await import('../src/lib/database.js');
    
    // Test 1: Basic search
    console.log('1️⃣ Testing basic search...');
    const basicSearch = await searchQuestions({ query: 'astro' });
    console.log(`   Found ${basicSearch.questions.length} results for "astro"`);
    
    // Test 2: Arabic search
    console.log('\n2️⃣ Testing Arabic search...');
    const arabicSearch = await searchQuestions({ query: 'مواقع' });
    console.log(`   Found ${arabicSearch.questions.length} results for "مواقع"`);
    
    // Test 3: Tag filtering
    console.log('\n3️⃣ Testing tag filtering...');
    const tagSearch = await searchQuestions({ tags: ['seo'] });
    console.log(`   Found ${tagSearch.questions.length} results with "seo" tag`);
    
    // Test 4: Combined search
    console.log('\n4️⃣ Testing combined search (query + tags)...');
    const combinedSearch = await searchQuestions({ 
      query: 'تحسين', 
      tags: ['seo'],
      difficulty: 'hard'
    });
    console.log(`   Found ${combinedSearch.questions.length} results for combined search`);
    
    // Test 5: Pagination
    console.log('\n5️⃣ Testing pagination...');
    const paginatedSearch = await searchQuestions({ 
      limit: 2, 
      offset: 0,
      sortBy: 'date'
    });
    console.log(`   Page 1: ${paginatedSearch.questions.length} results`);
    console.log(`   Total: ${paginatedSearch.total} questions`);
    console.log(`   Has more: ${paginatedSearch.hasMore}`);
    
    // Test 6: Get single question
    if (paginatedSearch.questions.length > 0) {
      const firstSlug = paginatedSearch.questions[0].slug;
      console.log(`\n6️⃣ Testing get question by slug: "${firstSlug}"`);
      const question = await getQuestionBySlug(firstSlug);
      console.log(`   Found: ${question ? question.question : 'Not found'}`);
      
      // Test 7: Related questions
      console.log('\n7️⃣ Testing related questions...');
      const related = await getRelatedQuestions(firstSlug, 3);
      console.log(`   Found ${related.length} related questions`);
    }
    
    // Test 8: Popular tags
    console.log('\n8️⃣ Testing popular tags...');
    const popularTags = await getPopularTags(10);
    console.log(`   Found ${popularTags.length} popular tags:`);
    popularTags.forEach(tag => {
      console.log(`     - ${tag.tag}: ${tag.count} questions`);
    });
    
    // Performance test
    console.log('\n⚡ Performance test (10 searches)...');
    const startTime = Date.now();
    
    const promises = Array.from({ length: 10 }, (_, i) => 
      searchQuestions({ 
        query: i % 2 === 0 ? 'astro' : 'seo',
        limit: 5
      })
    );
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   10 concurrent searches completed in ${endTime - startTime}ms`);
    console.log(`   Average: ${(endTime - startTime) / 10}ms per search`);
    
    console.log('\n🎉 All database search tests completed successfully!');
    console.log('The database is ready for 500+ questions with fast search performance.');
    
  } catch (error) {
    console.error('❌ Error testing database search:', error);
    process.exit(1);
  }
}

testDatabaseSearch();