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
        
        // Simple approach: build different queries based on filters
        let questionsResult: any;
        let countResult: any;

        if (query.trim() && tags.length > 0 && difficulty) {
            // All filters
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND tags && ${tags}
                  AND difficulty = ${difficulty}
                ORDER BY ts_rank(search_vector, to_tsquery('simple', ${searchQuery})) DESC, pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND tags && ${tags}
                  AND difficulty = ${difficulty}
            `;
        } else if (query.trim() && tags.length > 0) {
            // Query + tags
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND tags && ${tags}
                ORDER BY ts_rank(search_vector, to_tsquery('simple', ${searchQuery})) DESC, pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND tags && ${tags}
            `;
        } else if (query.trim() && difficulty) {
            // Query + difficulty
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND difficulty = ${difficulty}
                ORDER BY ts_rank(search_vector, to_tsquery('simple', ${searchQuery})) DESC, pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                  AND difficulty = ${difficulty}
            `;
        } else if (query.trim()) {
            // Query only
            const searchQuery = query.trim().replace(/[^\w\s\u0600-\u06FF]/g, '').split(/\s+/).join(' & ');
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
                ORDER BY ts_rank(search_vector, to_tsquery('simple', ${searchQuery})) DESC, pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE search_vector @@ to_tsquery('simple', ${searchQuery})
            `;
        } else if (tags.length > 0 && difficulty) {
            // Tags + difficulty
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE tags && ${tags} AND difficulty = ${difficulty}
                ORDER BY pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE tags && ${tags} AND difficulty = ${difficulty}
            `;
        } else if (tags.length > 0) {
            // Tags only
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE tags && ${tags}
                ORDER BY pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE tags && ${tags}
            `;
        } else if (difficulty) {
            // Difficulty only
            questionsResult = await sql`
                SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                       difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                       hero_image as "heroImage", rating_sum as "ratingSum", 
                       rating_count as "ratingCount", rating_avg as "ratingAvg",
                       created_at as "createdAt", updated_at as "updatedAt"
                FROM questions 
                WHERE difficulty = ${difficulty}
                ORDER BY pub_date DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            countResult = await sql`
                SELECT COUNT(*) as total FROM questions 
                WHERE difficulty = ${difficulty}
            `;
        } else {
            // No filters - all questions
            const orderBy = sortBy === 'date' 
                ? (sortOrder === 'desc' ? 'pub_date DESC' : 'pub_date ASC')
                : sortBy === 'rating'
                ? (sortOrder === 'desc' ? 'rating_avg DESC, rating_count DESC' : 'rating_avg ASC, rating_count ASC')
                : 'pub_date DESC';

            if (orderBy === 'pub_date DESC') {
                questionsResult = await sql`
                    SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                           difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                           hero_image as "heroImage", rating_sum as "ratingSum", 
                           rating_count as "ratingCount", rating_avg as "ratingAvg",
                           created_at as "createdAt", updated_at as "updatedAt"
                    FROM questions 
                    ORDER BY pub_date DESC
                    LIMIT ${limit} OFFSET ${offset}
                `;
            } else if (orderBy === 'rating_avg DESC, rating_count DESC') {
                questionsResult = await sql`
                    SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                           difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                           hero_image as "heroImage", rating_sum as "ratingSum", 
                           rating_count as "ratingCount", rating_avg as "ratingAvg",
                           created_at as "createdAt", updated_at as "updatedAt"
                    FROM questions 
                    ORDER BY rating_avg DESC, rating_count DESC
                    LIMIT ${limit} OFFSET ${offset}
                `;
            } else {
                questionsResult = await sql`
                    SELECT id, slug, question, short_answer as "shortAnswer", content, tags, 
                           difficulty, pub_date as "pubDate", updated_date as "updatedDate", 
                           hero_image as "heroImage", rating_sum as "ratingSum", 
                           rating_count as "ratingCount", rating_avg as "ratingAvg",
                           created_at as "createdAt", updated_at as "updatedAt"
                    FROM questions 
                    ORDER BY pub_date ASC
                    LIMIT ${limit} OFFSET ${offset}
                `;
            }
            
            countResult = await sql`SELECT COUNT(*) as total FROM questions`;
        }

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