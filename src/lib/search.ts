/**
 * Database-first search interface - file-based search has been removed
 * All search functionality now uses PostgreSQL full-text search exclusively
 */

import { createDatabaseConnection, executeQuery, DatabaseOperations } from './database';

// Type definitions for search functionality
export interface Question {
  id: number;
  slug: string;
  question: string;
  short_answer: string;
  content: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  pub_date: Date;
  updated_date?: Date;
  hero_image?: string;
  rating_sum: number;
  rating_count: number;
  rating_avg: number;
  created_at: Date;
  updated_at: Date;
}

export interface SearchOptions {
  query?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  limit?: number;
  offset?: number;
  page?: number;
  sortBy?: 'relevance' | 'date';
}

export interface SearchResult {
  questions: Question[];
  total: number;
  hasMore: boolean;
}

/**
 * Database-only search function using PostgreSQL full-text search
 */
export async function searchQuestions(options: SearchOptions = {}): Promise<SearchResult> {
  if (!process.env.DATABASE_URL) {
    console.error('Database not configured. Please set DATABASE_URL environment variable.');
    return {
      questions: [],
      total: 0,
      hasMore: false
    };
  }

  try {
    const sql = createDatabaseConnection();
    const { query = '', page = 1, limit = 10 } = options;
    
    const result = await DatabaseOperations.searchQuestions(sql, query, page, limit);
    
    // Convert database result to SearchResult format
    return {
      questions: result.results || [],
      total: result.pagination?.total || 0,
      hasMore: result.pagination?.hasMore || false
    };
  } catch (error) {
    console.error('Database search failed:', error);
    return {
      questions: [],
      total: 0,
      hasMore: false
    };
  }
}

/**
 * Get question by slug - database-only function
 */
export async function getQuestionBySlug(slug: string): Promise<Question | null> {
  if (!process.env.DATABASE_URL) {
    console.error('Database not configured. Please set DATABASE_URL environment variable.');
    return null;
  }

  try {
    const sql = createDatabaseConnection();
    const result = await DatabaseOperations.getQuestionWithRatings(sql, slug);
    return result || null;
  } catch (error) {
    console.error('Database get failed:', error);
    return null;
  }
}

/**
 * Get popular tags - database-only function
 */
export async function getPopularTags(limit: number = 20): Promise<Array<{tag: string, count: number}>> {
  if (!process.env.DATABASE_URL) {
    console.error('Database not configured. Please set DATABASE_URL environment variable.');
    return [];
  }

  try {
    const sql = createDatabaseConnection();
    
    // Get popular tags from questions table
    const result = await executeQuery(sql, async (sql) => {
      return await sql`
        SELECT 
          unnest(tags) as tag,
          COUNT(*) as count
        FROM questions 
        GROUP BY unnest(tags)
        ORDER BY count DESC, tag ASC
        LIMIT ${limit}
      `;
    });
    
    return result.map((row: any) => ({
      tag: row.tag,
      count: parseInt(row.count)
    }));
  } catch (error) {
    console.error('Database tags failed:', error);
    return [];
  }
}