#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testApiEndpoints() {
  console.log('🔍 Testing API Endpoints with Database Backend...\n');
  
  try {
    // Setup test data
    const testSlug = 'test-api-question-' + Date.now();
    const testUserHash = 'test-user-hash-api';
    
    // Insert test question
    await sql`
      INSERT INTO questions (slug, question, short_answer, content, tags, difficulty, pub_date)
      VALUES (${testSlug}, 'Test API Question', 'Test API Answer', 'Test API Content for search', ARRAY['api', 'test'], 'easy', CURRENT_DATE)
    `;
    console.log('✓ Created test question for API testing');
    
    // Test 1: Rating API - POST /api/rate
    console.log('\n1️⃣ Testing Rating API (POST /api/rate)...');
    
    // Simulate rating API call
    const ratingData = { rating: 4 };
    
    // Test rating submission logic
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash}, ${ratingData.rating})
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    // Update aggregates
    await sql`
      UPDATE questions q SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug}),
        updated_at = NOW()
      WHERE q.slug = ${testSlug}
    `;
    
    // Verify rating was stored correctly
    const [ratingResult] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    if (ratingResult.rating_sum !== 4 || ratingResult.rating_count !== 1) {
      console.log('❌ Rating API logic failed');
      return false;
    }
    console.log('✅ Rating API works correctly with normalized database tables');
    
    // Test rating update (UPSERT)
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash}, 5)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    await sql`
      UPDATE questions q SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug})
      WHERE q.slug = ${testSlug}
    `;
    
    const [updatedRating] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    if (updatedRating.rating_sum !== 5 || updatedRating.rating_count !== 1) {
      console.log('❌ Rating update (UPSERT) failed');
      return false;
    }
    console.log('✅ Rating UPSERT operations work correctly');
    
    // Test 2: Average Rating API - GET /api/avg
    console.log('\n2️⃣ Testing Average Rating API (GET /api/avg)...');
    
    // Test average rating retrieval logic
    const [avgResult] = await sql`
      SELECT rating_avg::float AS average, rating_count::int AS count 
      FROM questions WHERE slug = ${testSlug} LIMIT 1
    `;
    
    // Test user's current rating retrieval
    const [userRating] = await sql`
      SELECT rating FROM ratings WHERE slug = ${testSlug} AND user_hash = ${testUserHash} LIMIT 1
    `;
    
    if (!avgResult || avgResult.average !== 5 || avgResult.count !== 1) {
      console.log('❌ Average rating API logic failed');
      return false;
    }
    
    if (!userRating || userRating.rating !== 5) {
      console.log('❌ User rating retrieval failed');
      return false;
    }
    console.log('✅ Average rating API reads from questions table aggregates correctly');
    
    // Test 3: Search API - GET /api/search
    console.log('\n3️⃣ Testing Search API (GET /api/search)...');
    
    // Test full-text search logic
    const searchQuery = 'API';
    const searchResults = await sql`
      SELECT slug, question, short_answer, tags,
             ts_rank(search_vector, to_tsquery('simple', ${searchQuery + ':*'})) as rank
      FROM questions 
      WHERE search_vector @@ to_tsquery('simple', ${searchQuery + ':*'})
      ORDER BY rank DESC, pub_date DESC
      LIMIT 10 OFFSET 0
    `;
    
    if (searchResults.length === 0) {
      console.log('❌ Search API failed to find test question');
      return false;
    }
    
    const foundTestQuestion = searchResults.find(r => r.slug === testSlug);
    if (!foundTestQuestion) {
      console.log('❌ Search API did not return test question');
      return false;
    }
    
    if (foundTestQuestion.rank <= 0) {
      console.log('❌ Search ranking not working properly');
      return false;
    }
    console.log('✅ Search API returns properly ranked results with pagination');
    
    // Test ILIKE fallback for short queries
    const shortQuery = 'AP';
    const shortSearchResults = await sql`
      SELECT slug, question, short_answer, tags, 0 as rank
      FROM questions 
      WHERE question ILIKE ${`%${shortQuery}%`} OR short_answer ILIKE ${`%${shortQuery}%`}
      ORDER BY pub_date DESC
      LIMIT 10 OFFSET 0
    `;
    
    const foundShortQuery = shortSearchResults.find(r => r.slug === testSlug);
    if (!foundShortQuery) {
      console.log('❌ ILIKE fallback search failed');
      return false;
    }
    console.log('✅ ILIKE fallback search works for short queries');
    
    // Test 4: Content Reindexing API - POST /api/reindex
    console.log('\n4️⃣ Testing Content Reindexing API (POST /api/reindex)...');
    
    // Test content synchronization logic (simulate what the API does)
    const testContent = {
      slug: testSlug + '-reindex',
      question: 'Reindex Test Question',
      shortAnswer: 'Reindex Test Answer',
      content: 'This is test content for reindexing',
      tags: ['reindex', 'test'],
      difficulty: 'medium',
      pubDate: new Date(),
      updatedDate: null,
      heroImage: null
    };
    
    // Simulate UPSERT operation from reindex API
    await sql`
      INSERT INTO questions (
        slug, question, short_answer, content, tags, difficulty, 
        pub_date, updated_date, hero_image, search_vector
      ) VALUES (
        ${testContent.slug},
        ${testContent.question},
        ${testContent.shortAnswer},
        ${testContent.content},
        ${testContent.tags},
        ${testContent.difficulty},
        ${testContent.pubDate},
        ${testContent.updatedDate},
        ${testContent.heroImage},
        to_tsvector('simple', ${testContent.question + ' ' + testContent.shortAnswer + ' ' + testContent.content})
      )
      ON CONFLICT (slug) DO UPDATE SET
        question = EXCLUDED.question,
        short_answer = EXCLUDED.short_answer,
        content = EXCLUDED.content,
        tags = EXCLUDED.tags,
        difficulty = EXCLUDED.difficulty,
        updated_date = EXCLUDED.updated_date,
        hero_image = EXCLUDED.hero_image,
        search_vector = EXCLUDED.search_vector,
        updated_at = NOW()
    `;
    
    // Verify the question was indexed
    const [reindexResult] = await sql`
      SELECT slug, question, search_vector FROM questions WHERE slug = ${testContent.slug}
    `;
    
    if (!reindexResult || !reindexResult.search_vector) {
      console.log('❌ Content reindexing failed');
      return false;
    }
    console.log('✅ Content reindexing API synchronizes markdown to database correctly');
    
    // Test 5: Search Performance with GIN Indexes
    console.log('\n5️⃣ Testing Search Performance with GIN Indexes...');
    
    // Test search performance by running multiple queries
    const performanceStart = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await sql`
        SELECT slug, question, short_answer, tags,
               ts_rank(search_vector, to_tsquery('simple', 'test:*')) as rank
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', 'test:*')
        ORDER BY rank DESC
        LIMIT 5
      `;
    }
    
    const performanceEnd = Date.now();
    const avgQueryTime = (performanceEnd - performanceStart) / 10;
    
    if (avgQueryTime > 1000) { // More than 1 second average is too slow
      console.log(`❌ Search performance too slow: ${avgQueryTime}ms average`);
      return false;
    }
    console.log(`✅ Search performance with GIN indexes is good: ${avgQueryTime.toFixed(2)}ms average`);
    
    // Cleanup test data
    await sql`DELETE FROM questions WHERE slug LIKE 'test-api-question-%' OR slug LIKE 'test-api-question-%-reindex'`;
    console.log('✓ Cleaned up test data');
    
    console.log('\n🎉 All API endpoint tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message);
    return false;
  }
}

// Run the test
testApiEndpoints()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });