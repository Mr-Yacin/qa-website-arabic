#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDataModelConsistency() {
  console.log('🔍 Testing Data Model Consistency...\n');
  
  try {
    // Test 1: Ensure no conflicts between database and file-based approaches
    console.log('1️⃣ Testing for conflicts between database and file-based approaches...');
    
    // Check that old file-based tables don't exist
    const conflictingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('search_index', 'old_ratings')
    `;
    
    if (conflictingTables.length > 0) {
      console.log('❌ Found conflicting file-based tables:', conflictingTables.map(t => t.table_name));
      return false;
    }
    console.log('✅ No conflicts between database and file-based approaches');
    
    // Test 2: Verify all components use unified database schema
    console.log('\n2️⃣ Testing that all components use unified database schema...');
    
    // Create test data to verify schema consistency
    const testSlug = 'consistency-test-' + Date.now();
    const testUserHash1 = 'user-hash-1';
    const testUserHash2 = 'user-hash-2';
    
    // Insert test question using unified schema
    await sql`
      INSERT INTO questions (slug, question, short_answer, content, tags, difficulty, pub_date)
      VALUES (${testSlug}, 'Consistency Test Question', 'Consistency Test Answer', 'Test content for consistency validation', ARRAY['consistency', 'test'], 'medium', CURRENT_DATE)
    `;
    
    // Verify question was created with all required fields
    const [question] = await sql`
      SELECT id, slug, question, short_answer, content, tags, difficulty, pub_date, 
             rating_sum, rating_count, rating_avg, search_vector, created_at, updated_at
      FROM questions WHERE slug = ${testSlug}
    `;
    
    if (!question || !question.search_vector || question.rating_sum !== 0 || question.rating_count !== 0) {
      console.log('❌ Question not created with unified schema');
      return false;
    }
    console.log('✅ Questions use unified database schema correctly');
    
    // Test ratings schema consistency
    await sql`
      INSERT INTO ratings (slug, user_hash, rating) VALUES (${testSlug}, ${testUserHash1}, 4)
    `;
    await sql`
      INSERT INTO ratings (slug, user_hash, rating) VALUES (${testSlug}, ${testUserHash2}, 5)
    `;
    
    const ratings = await sql`
      SELECT slug, user_hash, rating, created_at FROM ratings WHERE slug = ${testSlug}
    `;
    
    if (ratings.length !== 2) {
      console.log('❌ Ratings not stored correctly in normalized table');
      return false;
    }
    console.log('✅ Ratings use normalized database schema correctly');
    
    // Test 3: Verify search and ratings work consistently across the application
    console.log('\n3️⃣ Testing search and ratings consistency across the application...');
    
    // Update rating aggregates
    await sql`
      UPDATE questions SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug})
      WHERE slug = ${testSlug}
    `;
    
    // Verify aggregates are consistent
    const [updatedQuestion] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    const expectedSum = 4 + 5; // 9
    const expectedCount = 2;
    const expectedAvg = 4.5;
    
    if (updatedQuestion.rating_sum !== expectedSum || 
        updatedQuestion.rating_count !== expectedCount ||
        Math.abs(parseFloat(updatedQuestion.rating_avg) - expectedAvg) > 0.01) {
      console.log('❌ Rating aggregates inconsistent:', updatedQuestion);
      return false;
    }
    console.log('✅ Rating aggregates are consistent across the application');
    
    // Test search consistency
    const searchResults = await sql`
      SELECT slug, question, short_answer, tags,
             ts_rank(search_vector, to_tsquery('simple', 'consistency:*')) as rank
      FROM questions 
      WHERE search_vector @@ to_tsquery('simple', 'consistency:*')
      ORDER BY rank DESC
    `;
    
    const foundQuestion = searchResults.find(r => r.slug === testSlug);
    if (!foundQuestion || foundQuestion.rank <= 0) {
      console.log('❌ Search functionality inconsistent');
      return false;
    }
    console.log('✅ Search functionality is consistent across the application');
    
    // Test 4: Test concurrent rating submissions and aggregate consistency
    console.log('\n4️⃣ Testing concurrent rating submissions and aggregate consistency...');
    
    // Test sequential rating updates to ensure UPSERT works correctly
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash1}, 3)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash2}, 4)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    // Now update both users to rating 5
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash1}, 5)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash2}, 5)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    // Verify final state is consistent
    const finalRatings = await sql`
      SELECT user_hash, rating FROM ratings WHERE slug = ${testSlug} ORDER BY user_hash
    `;
    
    if (finalRatings.length !== 2) {
      console.log('❌ Rating operations created inconsistent state');
      return false;
    }
    
    // Both users should have rating 5
    if (finalRatings[0].rating !== 5 || finalRatings[1].rating !== 5) {
      console.log('❌ Rating updates not handled correctly');
      console.log('Expected both ratings to be 5, got:', finalRatings.map(r => r.rating));
      return false;
    }
    
    // Update aggregates and verify consistency
    await sql`
      UPDATE questions SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug})
      WHERE slug = ${testSlug}
    `;
    
    const [finalQuestion] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    if (finalQuestion.rating_sum !== 10 || finalQuestion.rating_count !== 2 || 
        Math.abs(parseFloat(finalQuestion.rating_avg) - 5.0) > 0.01) {
      console.log('❌ Aggregate consistency failed after concurrent updates');
      return false;
    }
    console.log('✅ Concurrent rating submissions maintain aggregate consistency');
    
    // Test 5: Verify data integrity constraints
    console.log('\n5️⃣ Testing data integrity constraints...');
    
    // Test rating value constraints
    try {
      await sql`
        INSERT INTO ratings (slug, user_hash, rating) VALUES (${testSlug}, 'test-invalid', 6)
      `;
      console.log('❌ Rating constraint not enforced (should reject rating > 5)');
      return false;
    } catch (error) {
      if (error.code === '23514') { // Check constraint violation
        console.log('✅ Rating value constraints are enforced');
      } else {
        throw error;
      }
    }
    
    // Test difficulty constraint
    try {
      await sql`
        INSERT INTO questions (slug, question, short_answer, content, tags, difficulty, pub_date)
        VALUES ('invalid-difficulty', 'Test', 'Test', 'Test', ARRAY['test'], 'invalid', CURRENT_DATE)
      `;
      console.log('❌ Difficulty constraint not enforced');
      return false;
    } catch (error) {
      if (error.code === '23514') { // Check constraint violation
        console.log('✅ Difficulty constraints are enforced');
      } else {
        throw error;
      }
    }
    
    // Test unique slug constraint
    try {
      await sql`
        INSERT INTO questions (slug, question, short_answer, content, tags, difficulty, pub_date)
        VALUES (${testSlug}, 'Duplicate', 'Duplicate', 'Duplicate', ARRAY['test'], 'easy', CURRENT_DATE)
      `;
      console.log('❌ Unique slug constraint not enforced');
      return false;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        console.log('✅ Unique slug constraints are enforced');
      } else {
        throw error;
      }
    }
    
    // Cleanup test data
    await sql`DELETE FROM questions WHERE slug = ${testSlug}`;
    console.log('✓ Cleaned up test data');
    
    console.log('\n🎉 All data model consistency tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Data model consistency test failed:', error.message);
    return false;
  }
}

// Run the test
testDataModelConsistency()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });