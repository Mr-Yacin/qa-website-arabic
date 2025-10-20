#!/usr/bin/env node

/**
 * Test search API functionality
 */

import fs from 'fs/promises';
import path from 'path';

// Import the search logic (simplified version for testing)
async function loadSearchIndex() {
  try {
    const indexPath = path.join(process.cwd(), 'data', 'search-index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading search index:', error);
    return { questions: [], lastUpdated: new Date().toISOString() };
  }
}

function calculateRelevanceScore(query, item, matchType) {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  const baseScores = {
    question: 100,
    answer: 80,
    tag: 60,
    content: 40,
  };
  
  score = baseScores[matchType] || 0;
  
  if (item.question.toLowerCase().includes(queryLower)) {
    score += 50;
  }
  
  const wordBoundaryRegex = new RegExp(`\\b${queryLower}`, 'i');
  if (wordBoundaryRegex.test(item.question)) {
    score += 30;
  }
  
  if (item.question.length < 50) {
    score += 10;
  }
  
  return score;
}

function searchQuestions(query, questions) {
  if (!query || query.length < 2) {
    return [];
  }
  
  const queryLower = query.toLowerCase();
  const results = [];
  
  for (const item of questions) {
    const matches = [];
    
    if (item.question.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'question',
        score: calculateRelevanceScore(query, item, 'question'),
      });
    }
    
    if (item.shortAnswer.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'answer',
        score: calculateRelevanceScore(query, item, 'answer'),
      });
    }
    
    const matchingTags = item.tags.filter(tag => 
      tag.toLowerCase().includes(queryLower)
    );
    if (matchingTags.length > 0) {
      matches.push({
        type: 'tag',
        score: calculateRelevanceScore(query, item, 'tag'),
      });
    }
    
    if (item.content.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'content',
        score: calculateRelevanceScore(query, item, 'content'),
      });
    }
    
    if (matches.length > 0) {
      const bestMatch = matches.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      results.push({
        slug: item.slug,
        question: item.question,
        shortAnswer: item.shortAnswer,
        tags: item.tags,
        matchType: bestMatch.type,
        relevanceScore: bestMatch.score,
      });
    }
  }
  
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

async function testSearchAPI() {
  try {
    console.log('Testing Search API functionality...\n');
    
    // Load search index
    const searchIndex = await loadSearchIndex();
    console.log(`Loaded search index with ${searchIndex.questions.length} questions\n`);
    
    // Test queries
    const testQueries = ['astro', 'seo', 'مواقع', 'تحسين', 'xyz'];
    
    for (const query of testQueries) {
      console.log(`Testing query: "${query}"`);
      const results = searchQuestions(query, searchIndex.questions);
      
      if (results.length > 0) {
        console.log(`  Found ${results.length} results:`);
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. ${result.question} (${result.matchType}, score: ${result.relevanceScore})`);
        });
      } else {
        console.log('  No results found');
      }
      console.log('');
    }
    
    console.log('Search API test completed successfully!');
    
  } catch (error) {
    console.error('Error testing search API:', error);
    process.exit(1);
  }
}

testSearchAPI();