/**
 * Database-backed search API with PostgreSQL full-text search and pagination
 * Uses tsvector and ts_rank for relevance scoring with ILIKE fallback for short queries
 */

import type { APIRoute } from 'astro';
import { createDatabaseConnection, executeQuery } from '../../lib/database';

// Search result interface
interface SearchResult {
  slug: string;
  question: string;
  short_answer: string;
  tags: string[];
  difficulty: string;
  pub_date: string;
  rating_avg: number;
  rating_count: number;
  rank?: number;
}

// Search response interface
interface SearchResponse {
  suggestions: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  searchInfo: {
    query: string;
    resultsCount: number;
  };
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const query = searchParams.get('q')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '10')), 50);
    const offset = (page - 1) * limit;
    
    // Validate query length
    if (query.length > 200) {
      return new Response(JSON.stringify({ 
        error: 'Search query too long (max 200 characters)',
        suggestions: [],
        pagination: { page: 1, limit, total: 0, hasMore: false },
        searchInfo: { query, resultsCount: 0 }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return empty results for empty query
    if (!query) {
      return new Response(JSON.stringify({
        suggestions: [],
        pagination: { page: 1, limit, total: 0, hasMore: false },
        searchInfo: { query: '', resultsCount: 0 }
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    const sql = createDatabaseConnection();
    
    let results: SearchResult[];
    let countResult: { total: number }[];

    if (query.length >= 3) {
      // Use PostgreSQL full-text search for longer queries
      results = await executeQuery(sql, async (sql) => {
        return await sql`
          SELECT 
            slug, 
            question, 
            short_answer, 
            tags,
            difficulty,
            pub_date::text,
            COALESCE(rating_avg, 0)::float as rating_avg,
            COALESCE(rating_count, 0)::int as rating_count,
            ts_rank(search_vector, to_tsquery('simple', ${query + ':*'}))::float as rank
          FROM questions 
          WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
          ORDER BY rank DESC, pub_date DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      });
      
      countResult = await executeQuery(sql, async (sql) => {
        return await sql`
          SELECT COUNT(*)::int as total
          FROM questions 
          WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
        `;
      });
    } else {
      // Use ILIKE for short queries (fallback)
      const likePattern = `%${query}%`;
      
      results = await executeQuery(sql, async (sql) => {
        return await sql`
          SELECT 
            slug, 
            question, 
            short_answer, 
            tags,
            difficulty,
            pub_date::text,
            COALESCE(rating_avg, 0)::float as rating_avg,
            COALESCE(rating_count, 0)::int as rating_count,
            0::float as rank
          FROM questions 
          WHERE question ILIKE ${likePattern} OR short_answer ILIKE ${likePattern}
          ORDER BY pub_date DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      });
      
      countResult = await executeQuery(sql, async (sql) => {
        return await sql`
          SELECT COUNT(*)::int as total
          FROM questions 
          WHERE question ILIKE ${likePattern} OR short_answer ILIKE ${likePattern}
        `;
      });
    }

    const total = countResult[0]?.total || 0;
    const hasMore = offset + results.length < total;

    // Format results for response
    const suggestions = results.map(row => ({
      slug: row.slug,
      question: row.question,
      short_answer: row.short_answer,
      tags: row.tags,
      difficulty: row.difficulty,
      pub_date: row.pub_date,
      rating_avg: row.rating_avg,
      rating_count: row.rating_count,
      rank: row.rank
    }));

    const response: SearchResponse = {
      suggestions,
      pagination: {
        page,
        limit,
        total,
        hasMore
      },
      searchInfo: {
        query,
        resultsCount: results.length
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
    console.error('Database search API error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      suggestions: [],
      pagination: { page: 1, limit: 10, total: 0, hasMore: false },
      searchInfo: { query: '', resultsCount: 0 },
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const prerender = false;