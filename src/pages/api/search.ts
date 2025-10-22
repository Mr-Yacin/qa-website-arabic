import type { APIRoute } from 'astro';
import { loadSearchIndex as loadSearchIndexFromStorage } from '../../lib/dataStorage.js';
import type { SearchQuestion } from '../../lib/dataStorage.js';

interface SearchSuggestion {
  slug: string;
  question: string;
  shortAnswer: string;
  tags: string[];
  matchType: 'question' | 'answer' | 'content' | 'tag';
  relevanceScore: number;
}

/**
 * Load search index from database or fallback storage
 */
async function loadSearchIndex(): Promise<{ questions: SearchQuestion[]; lastUpdated: string }> {
  try {
    const searchIndex = await loadSearchIndexFromStorage();
    return {
      questions: searchIndex.questions,
      lastUpdated: searchIndex.lastUpdated?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading search index from storage:', error);
    // Return empty index if loading fails
    return {
      questions: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(
  query: string,
  item: SearchQuestion,
  matchType: string
): number {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Base scores by match type
  const baseScores = {
    question: 100,
    answer: 80,
    tag: 60,
    content: 40,
  };
  
  score = baseScores[matchType as keyof typeof baseScores] || 0;
  
  // Boost for exact matches
  if (item.question.toLowerCase().includes(queryLower)) {
    score += 50;
  }
  
  // Boost for word boundary matches
  const wordBoundaryRegex = new RegExp(`\\b${queryLower}`, 'i');
  if (wordBoundaryRegex.test(item.question)) {
    score += 30;
  }
  
  // Boost for shorter questions (more specific)
  if (item.question.length < 50) {
    score += 10;
  }
  
  // Boost for recent content (if pubDate exists)
  if (item.pubDate) {
    const pubDate = new Date(item.pubDate);
    const daysSincePublished = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 30) {
      score += 20;
    } else if (daysSincePublished < 90) {
      score += 10;
    }
  }
  
  return score;
}

/**
 * Perform fuzzy search on questions
 */
function searchQuestions(query: string, questions: SearchQuestion[]): SearchSuggestion[] {
  if (!query || query.length < 2) {
    return [];
  }
  
  const queryLower = query.toLowerCase();
  const results: SearchSuggestion[] = [];
  
  for (const item of questions) {
    const matches: { type: string; score: number }[] = [];
    
    // Search in question title
    if (item.question.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'question',
        score: calculateRelevanceScore(query, item, 'question'),
      });
    }
    
    // Search in short answer
    if (item.shortAnswer.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'answer',
        score: calculateRelevanceScore(query, item, 'answer'),
      });
    }
    
    // Search in tags
    const matchingTags = item.tags.filter(tag => 
      tag.toLowerCase().includes(queryLower)
    );
    if (matchingTags.length > 0) {
      matches.push({
        type: 'tag',
        score: calculateRelevanceScore(query, item, 'tag'),
      });
    }
    
    // Search in content
    if (item.content.toLowerCase().includes(queryLower)) {
      matches.push({
        type: 'content',
        score: calculateRelevanceScore(query, item, 'content'),
      });
    }
    
    // Search in processed search terms
    const matchingTerms = item.searchTerms.filter(term => 
      term.includes(queryLower)
    );
    if (matchingTerms.length > 0 && matches.length === 0) {
      matches.push({
        type: 'content',
        score: calculateRelevanceScore(query, item, 'content') * 0.7, // Lower score for term matches
      });
    }
    
    // If we have matches, add the best one to results
    if (matches.length > 0) {
      const bestMatch = matches.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      results.push({
        slug: item.slug,
        question: item.question,
        shortAnswer: item.shortAnswer,
        tags: item.tags,
        matchType: bestMatch.type as 'question' | 'answer' | 'content' | 'tag',
        relevanceScore: bestMatch.score,
      });
    }
  }
  
  // Sort by relevance score (descending) and limit results
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5); // Limit to 5 suggestions as per requirements
}

/**
 * Highlight matching text in search results
 */
function highlightMatches(text: string, query: string): string {
  if (!query || query.length < 2) {
    return text;
  }
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Find all matches
  const matches: { start: number; end: number }[] = [];
  let index = 0;
  
  while (index < textLower.length) {
    const matchIndex = textLower.indexOf(queryLower, index);
    if (matchIndex === -1) break;
    
    matches.push({
      start: matchIndex,
      end: matchIndex + query.length,
    });
    
    index = matchIndex + 1;
  }
  
  if (matches.length === 0) {
    return text;
  }
  
  // Build highlighted text
  let result = '';
  let lastEnd = 0;
  
  for (const match of matches) {
    result += text.substring(lastEnd, match.start);
    result += `<mark>${text.substring(match.start, match.end)}</mark>`;
    lastEnd = match.end;
  }
  
  result += text.substring(lastEnd);
  return result;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    // Get query parameter
    const query = url.searchParams.get('q');
    
    // Validate query parameter
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: query ? 'الاستعلام قصير جداً' : 'معامل البحث مطلوب' // Query too short or missing in Arabic
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          },
        }
      );
    }
    
    // Load search index
    const searchIndex = await loadSearchIndex();
    
    if (searchIndex.questions.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: 'فهرس البحث غير متوفر' // Search index not available in Arabic
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60', // Shorter cache for empty index
          },
        }
      );
    }
    
    // Perform search
    const searchResults = searchQuestions(query.trim(), searchIndex.questions);
    
    // Format results with highlighting
    const suggestions = searchResults.map(result => ({
      slug: result.slug,
      question: highlightMatches(result.question, query.trim()),
      shortAnswer: highlightMatches(result.shortAnswer, query.trim()),
      tags: result.tags,
      matchType: result.matchType,
      relevanceScore: result.relevanceScore,
    }));
    
    console.log(`Search performed for query: "${query}" - ${suggestions.length} results found`);
    
    return new Response(
      JSON.stringify({ 
        suggestions,
        query: query.trim(),
        total: suggestions.length,
        hasMore: false, // We limit to 5, so no pagination needed
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
    
  } catch (error) {
    console.error('Search API error:', error);
    
    return new Response(
      JSON.stringify({ 
        suggestions: [],
        message: 'خطأ في البحث' // Search error in Arabic
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};