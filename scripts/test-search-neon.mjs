#!/usr/bin/env node

/**
 * Test search API with Neon database
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSearchWithNeon() {
  try {
    console.log('🔍 Testing Search API with Neon Database...\n');
    
    // Import the dataStorage functions
    const { neon } = await import('@neondatabase/serverless');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Test loading search index from database
    console.log('📖 Loading search index from Neon database...');
    const [row] = await sql`
      SELECT questions_data, last_updated 
      FROM search_index 
      ORDER BY last_updated DESC 
      LIMIT 1
    `;
    
    if (!row) {
      console.error('❌ No search index found in database');
      process.exit(1);
    }
    
    const searchIndex = {
      questions: row.questions_data,
      lastUpdated: new Date(row.last_updated)
    };
    
    console.log(`✅ Loaded search index with ${searchIndex.questions.length} questions`);
    console.log(`✅ Last updated: ${searchIndex.lastUpdated}`);
    
    // Test search functionality
    const testQueries = ['astro', 'seo', 'مواقع', 'تحسين'];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const queryLower = query.toLowerCase();
      const results = searchIndex.questions.filter(item => {
        return (
          item.question.toLowerCase().includes(queryLower) ||
          item.shortAnswer.toLowerCase().includes(queryLower) ||
          item.content.toLowerCase().includes(queryLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
          item.searchTerms.some(term => term.toLowerCase().includes(queryLower))
        );
      });
      
      if (results.length > 0) {
        console.log(`  ✅ Found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. ${result.question}`);
        });
      } else {
        console.log('  ℹ️  No results found');
      }
    }
    
    console.log('\n🎉 Search API with Neon database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing search with Neon:', error);
    process.exit(1);
  }
}

testSearchWithNeon();