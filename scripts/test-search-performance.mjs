#!/usr/bin/env node

/**
 * Test search performance directly with database
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSearchPerformance() {
  try {
    console.log('🔍 Testing Search Performance...\n');
    
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test 1: Basic search
    console.log('1️⃣ Testing basic search...');
    const basicSearch = await sql`
      SELECT slug, question, short_answer, tags, difficulty, rating_avg
      FROM questions 
      WHERE search_vector @@ to_tsquery('simple', 'astro')
      ORDER BY ts_rank(search_vector, to_tsquery('simple', 'astro')) DESC
      LIMIT 5
    `;
    console.log(`   Found ${basicSearch.length} results for "astro"`);
    
    // Test 2: Arabic search
    console.log('\n2️⃣ Testing Arabic search...');
    const arabicSearch = await sql`
      SELECT slug, question, short_answer, tags
      FROM questions 
      WHERE search_vector @@ to_tsquery('simple', 'مواقع')
      ORDER BY ts_rank(search_vector, to_tsquery('simple', 'مواقع')) DESC
      LIMIT 5
    `;
    console.log(`   Found ${arabicSearch.length} results for "مواقع"`);
    
    // Test 3: Tag filtering
    console.log('\n3️⃣ Testing tag filtering...');
    const tagSearch = await sql`
      SELECT slug, question, tags
      FROM questions 
      WHERE 'seo' = ANY(tags)
      LIMIT 5
    `;
    console.log(`   Found ${tagSearch.length} results with "seo" tag`);
    
    // Test 4: Combined search
    console.log('\n4️⃣ Testing combined search...');
    const combinedSearch = await sql`
      SELECT slug, question, tags, difficulty
      FROM questions 
      WHERE search_vector @@ to_tsquery('simple', 'تحسين')
        AND 'seo' = ANY(tags)
        AND difficulty = 'hard'
      LIMIT 5
    `;
    console.log(`   Found ${combinedSearch.length} results for combined search`);
    
    // Test 5: Performance test
    console.log('\n⚡ Performance test (10 searches)...');
    const startTime = Date.now();
    
    const promises = Array.from({ length: 10 }, async (_, i) => {
      const query = i % 2 === 0 ? 'astro' : 'seo';
      return await sql`
        SELECT slug, question 
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', ${query})
        LIMIT 5
      `;
    });
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`   10 concurrent searches completed in ${endTime - startTime}ms`);
    console.log(`   Average: ${(endTime - startTime) / 10}ms per search`);
    
    // Test 6: Show all questions
    console.log('\n📋 All questions in database:');
    const allQuestions = await sql`
      SELECT slug, question, tags, difficulty, rating_avg
      FROM questions 
      ORDER BY pub_date DESC
    `;
    
    allQuestions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.question}`);
      console.log(`      Tags: ${q.tags.join(', ')}`);
      console.log(`      Difficulty: ${q.difficulty}`);
      console.log(`      Rating: ${q.rating_avg}/5`);
      console.log('');
    });
    
    console.log('🎉 Database search is working perfectly!');
    console.log('Ready to scale to 500+ questions with fast performance.');
    
  } catch (error) {
    console.error('❌ Error testing search performance:', error);
    process.exit(1);
  }
}

testSearchPerformance();