/**
 * Database utilities for questions with full-text search
 * Optimized for 500+ questions
 */

import { neon } from '@neondatabase/serverless';

let sql: ReturnType<typeof neon> | null = null;

function getDatabase() {
    if (!sql) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is required');
        }
        sql = neon(process.env.DATABASE_URL);
    }
    return sql;
}

export interface Question {
    id: number;
    slug: string;
    question: string;
    shortAnswer: string;
    content: string;
    tags: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    pubDate: Date;
    updatedDate?: Date;
    heroImage?: string;
    ratingSum: number;
    ratingCount: number;
    ratingAvg: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SearchOptions {
    query?: string;
    tags?: string[];
    difficulty?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'date' | 'rating' | 'relevance';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
    questions: Question[];
    total: number;
    hasMore: boolean;
}

/**
 * Search questions with full-text search and filters
 */
export async function searchQuestions(options: SearchOptions = {}): Promise<SearchResult> {
    const {
        query = '',
        tags = [],
        difficulty,
        limit = 10,
        offset = 0,
        sortBy = 'relevance',
        sortOrder = 'desc'
    } = options;

    try {
        const sql = getDatabase();
        let baseQuery = sql`SELECT 
      id, slug, question, short_answer as "shortAnswer", content, tags, 
      difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
      hero_image as "heroImage", rating_sum as "ratingSum", 
      rating_count as "ratingCount", rating_avg as "ratingAvg",
      created_at as "createdAt", updated_at as "updatedAt"
    FROM questions`;

        let countQuery = sql`SELECT COUNT(*) as total FROM questions`;
        let whereConditions = [];

        // Full-text search
        if (query.trim()) {
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            whereConditions.push(sql`search_vector @@ to_tsquery('simple', ${searchQuery})`);
        }

        // Tag filter
        if (tags.length > 0) {
            whereConditions.push(sql`tags && ${tags}`);
        }

        // Difficulty filter
        if (difficulty) {
            whereConditions.push(sql`difficulty = ${difficulty}`);
        }

        // Apply WHERE conditions
        if (whereConditions.length > 0) {
            const whereClause = whereConditions.reduce((acc, condition, index) => {
                return index === 0 ? sql`WHERE ${condition}` : sql`${acc} AND ${condition}`;
            });
            baseQuery = sql`${baseQuery} ${whereClause}`;
            countQuery = sql`${countQuery} ${whereClause}`;
        }

        // Apply ORDER BY
        if (sortBy === 'date') {
            const direction = sortOrder.toUpperCase();
            if (direction === 'DESC') {
                baseQuery = sql`${baseQuery} ORDER BY pub_date DESC`;
            } else {
                baseQuery = sql`${baseQuery} ORDER BY pub_date ASC`;
            }
        } else if (sortBy === 'rating') {
            const direction = sortOrder.toUpperCase();
            if (direction === 'DESC') {
                baseQuery = sql`${baseQuery} ORDER BY rating_avg DESC, rating_count DESC`;
            } else {
                baseQuery = sql`${baseQuery} ORDER BY rating_avg ASC, rating_count ASC`;
            }
        } else if (query.trim()) {
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            baseQuery = sql`${baseQuery} ORDER BY ts_rank(search_vector, to_tsquery('simple', ${searchQuery})) DESC, pub_date DESC`;
        } else {
            baseQuery = sql`${baseQuery} ORDER BY pub_date DESC`;
        }

        // Apply LIMIT and OFFSET
        baseQuery = sql`${baseQuery} LIMIT ${limit} OFFSET ${offset}`;

        const [countResult, questionsResult] = await Promise.all([
            countQuery,
            baseQuery
        ]);

        const total = parseInt((countResult as any)[0]?.total || '0');
        const questions = questionsResult as Question[];
        const hasMore = offset + limit < total;

        return {
            questions,
            total,
            hasMore
        };
    } catch (error) {
        console.error('Search error:', error);
        throw new Error('Failed to search questions');
    }
}

/**
 * Get question by slug
 */
export async function getQuestionBySlug(slug: string): Promise<Question | null> {
    try {
        const sql = getDatabase();
        const result = await sql`
      SELECT 
        id, slug, question, short_answer as "shortAnswer", content, tags, 
        difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
        hero_image as "heroImage", rating_sum as "ratingSum", 
        rating_count as "ratingCount", rating_avg as "ratingAvg",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM questions 
      WHERE slug = ${slug}
    `;

        return (result as any)[0] as Question || null;
    } catch (error) {
        console.error('Get question error:', error);
        return null;
    }
}

/**
 * Get related questions based on tags
 */
export async function getRelatedQuestions(slug: string, limit: number = 5): Promise<Question[]> {
    try {
        const sql = getDatabase();
        const result = await sql`
      WITH current_question AS (
        SELECT tags FROM questions WHERE slug = ${slug}
      )
      SELECT 
        q.id, q.slug, q.question, q.short_answer as "shortAnswer", q.content, q.tags, 
        q.difficulty, q.pub_date as "pubDate", q.updated_date as "updatedDate", 
        q.hero_image as "heroImage", q.rating_sum as "ratingSum", 
        q.rating_count as "ratingCount", q.rating_avg as "ratingAvg",
        q.created_at as "createdAt", q.updated_at as "updatedAt"
      FROM questions q, current_question cq
      WHERE q.slug != ${slug}
        AND q.tags && cq.tags
      ORDER BY 
        array_length(array(SELECT unnest(q.tags) INTERSECT SELECT unnest(cq.tags)), 1) DESC,
        q.rating_avg DESC,
        q.pub_date DESC
      LIMIT ${limit}
    `;

        return result as Question[];
    } catch (error) {
        console.error('Get related questions error:', error);
        return [];
    }
}

/**
 * Get popular tags with question counts
 */
export async function getPopularTags(limit: number = 20): Promise<Array<{ tag: string, count: number }>> {
    try {
        const sql = getDatabase();
        const result = await sql`
      SELECT 
        tag,
        COUNT(*) as count
      FROM questions, unnest(tags) as tag
      GROUP BY tag
      ORDER BY count DESC, tag ASC
      LIMIT ${limit}
    `;

        return (result as any[]).map((row: any) => ({
            tag: row.tag,
            count: parseInt(row.count)
        }));
    } catch (error) {
        console.error('Get popular tags error:', error);
        return [];
    }
}

/**
 * Update question rating
 */
export async function updateQuestionRating(slug: string, rating: number): Promise<boolean> {
    try {
        const sql = getDatabase();
        await sql`
      UPDATE questions 
      SET 
        rating_sum = rating_sum + ${rating},
        rating_count = rating_count + 1,
        rating_avg = ROUND((rating_sum + ${rating})::decimal / (rating_count + 1), 2)
      WHERE slug = ${slug}
    `;
        return true;
    } catch (error) {
        console.error('Update rating error:', error);
        return false;
    }
}