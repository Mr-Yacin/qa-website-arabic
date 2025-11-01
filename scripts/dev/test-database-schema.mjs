#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema and Operations...\n');
  
  try {
    // Test 1: Verify questions table structure
    console.log('1️⃣ Testing questions table structure...');
    const questionsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position
    `;
    
    const expectedColumns = [
      'id', 'slug', 'question', 'short_answer', 'content', 'tags', 
      'difficulty', 'pub_date', 'updated_date', 'hero_image',
      'rating_sum', 'rating_count', 'rating_avg', 'search_vector',
      'created_at', 'updated_at'
    ];
    
    const actualColumns = questionsSchema.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns:', missingColumns);
      return false;
    }
    console.log('✅ Questions table structure is correct');
    
    // Test 2: Verify ratings table structure
    console.log('\n2️⃣ Testing ratings table structure...');
    const ratingsSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'ratings' 
      ORDER BY ordinal_position
    `;
    
    const expectedRatingColumns = ['slug', 'user_hash', 'rating', 'created_at'];
    const actualRatingColumns = ratingsSchema.map(col => col.column_name);
    const missingRatingColumns = expectedRatingColumns.filter(col => !actualRatingColumns.includes(col));
    
    if (missingRatingColumns.length > 0) {
      console.log('❌ Missing rating columns:', missingRatingColumns);
      return false;
    }
    console.log('✅ Ratings table structure is correct');
    
    // Test 3: Verify indexes exist
    console.log('\n3️⃣ Testing database indexes...');
    const indexes = await sql`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('questions', 'ratings')
      AND schemaname = 'public'
    `;
    
    const indexNames = indexes.map(idx => idx.indexname);
    const requiredIndexes = ['idx_questions_tsv', 'idx_questions_slug', 'idx_ratings_slug'];
    const missingIndexes = requiredIndexes.filter(idx => !indexNames.includes(idx));
    
    if (missingIndexes.length > 0) {
      console.log('❌ Missing indexes:', missingIndexes);
      return false;
    }
    console.log('✅ Required indexes are present');
    
    // Test 4: Test rating UPSERT operations
    console.log('\n4️⃣ Testing rating UPSERT operations...');
    const testSlug = 'test-question-' + Date.now();
    const testUserHash = 'test-user-hash';
    
    // Insert test question
    await sql`
      INSERT INTO questions (slug, question, short_answer, content, tags, difficulty, pub_date)
      VALUES (${testSlug}, 'Test Question', 'Test Answer', 'Test Content', ARRAY['test'], 'easy', CURRENT_DATE)
    `;
    
    // Test initial rating
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash}, 4)
    `;
    
    // Update aggregates
    await sql`
      UPDATE questions SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug})
      WHERE slug = ${testSlug}
    `;
    
    // Verify initial rating
    const [initialResult] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    if (initialResult.rating_sum !== 4 || initialResult.rating_count !== 1) {
      console.log('❌ Initial rating aggregation failed');
      return false;
    }
    
    // Test rating update (UPSERT)
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${testSlug}, ${testUserHash}, 5)
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;
    
    // Update aggregates again
    await sql`
      UPDATE questions SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${testSlug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${testSlug})
      WHERE slug = ${testSlug}
    `;
    
    // Verify updated rating
    const [updatedResult] = await sql`
      SELECT rating_sum, rating_count, rating_avg FROM questions WHERE slug = ${testSlug}
    `;
    
    if (updatedResult.rating_sum !== 5 || updatedResult.rating_count !== 1) {
      console.log('❌ Rating UPSERT failed');
      return false;
    }
    console.log('✅ Rating UPSERT operations work correctly');
    
    // Test 5: Test search vector generation
    console.log('\n5️⃣ Testing automatic search vector generation...');
    const searchResult = await sql`
      SELECT search_vector FROM questions WHERE slug = ${testSlug}
    `;
    
    if (!searchResult[0]?.search_vector) {
      console.log('❌ Search vector not generated');
      return false;
    }
    console.log('✅ Search vector generation works');
    
    // Test 6: Test foreign key constraints and CASCADE DELETE
    console.log('\n6️⃣ Testing foreign key constraints and CASCADE DELETE...');
    
    // Verify rating exists
    const ratingsBefore = await sql`
      SELECT COUNT(*) as count FROM ratings WHERE slug = ${testSlug}
    `;
    
    if (parseInt(ratingsBefore[0].count) !== 1) {
      console.log('❌ Test rating not found, count:', ratingsBefore[0].count);
      return false;
    }
    
    // Delete question (should cascade delete ratings)
    await sql`DELETE FROM questions WHERE slug = ${testSlug}`;
    
    // Verify rating was deleted
    const ratingsAfter = await sql`
      SELECT COUNT(*) as count FROM ratings WHERE slug = ${testSlug}
    `;
    
    if (parseInt(ratingsAfter[0].count) !== 0) {
      console.log('❌ CASCADE DELETE not working, count:', ratingsAfter[0].count);
      return false;
    }
    console.log('✅ Foreign key constraints and CASCADE DELETE work correctly');
    
    console.log('\n🎉 All database schema tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database schema test failed:', error.message);
    return false;
  }
}

// Run the test
testDatabaseSchema()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });