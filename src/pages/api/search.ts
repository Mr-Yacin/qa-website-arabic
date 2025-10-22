/**
 * Search API endpoint using database full-text search
 * Optimized for 500+ questions
 */

import type { APIRoute } from 'astro';
import { searchQuestions } from '../../lib/search';

export const GET: APIRoute = async ({ request }) => {
  try {
    const searchParams = new URL(request.url).searchParams;
    
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const difficulty = searchParams.get('difficulty') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Max 50 per page
    const sortBy = (searchParams.get('sort') as 'date' | 'rating' | 'relevance') || 'relevance';
    const sortOrder = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    
    const offset = (page - 1) * limit;
    
    // Validate inputs
    if (page < 1) {
      return new Response(JSON.stringify({ 
        error: 'Invalid page number' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (query.length > 200) {
      return new Response(JSON.stringify({ 
        error: 'Search query too long' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Perform search
    const result = await searchQuestions({
      query,
      tags,
      difficulty,
      limit,
      offset,
      sortBy,
      sortOrder
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(result.total / limit);
    const currentPage = page;
    
    // Format questions for both full results and suggestions
    const formattedQuestions = result.questions.map(q => ({
      slug: q.slug,
      question: q.question,
      shortAnswer: q.shortAnswer,
      tags: q.tags,
      difficulty: q.difficulty,
      pubDate: q.pubDate,
      ratingAvg: q.ratingAvg,
      ratingCount: q.ratingCount
    }));

    const response = {
      questions: formattedQuestions,
      suggestions: formattedQuestions.slice(0, 5), // First 5 for dropdown suggestions
      pagination: {
        currentPage,
        totalPages,
        totalQuestions: result.total,
        hasNext: result.hasMore,
        hasPrev: currentPage > 1,
        limit
      },
      searchInfo: {
        query,
        tags,
        difficulty,
        sortBy,
        sortOrder,
        resultsCount: result.questions.length
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });
    
  } catch (error) {
    console.error('Search API error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;