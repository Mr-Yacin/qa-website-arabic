/**
 * Database connection utilities with error handling and configuration
 */

import { neon } from '@neondatabase/serverless';

// Database connection interface
export interface DatabaseConnection {
  sql: (query: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
}

// Database configuration
interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// Connection pool management
class DatabasePool {
  private static instance: DatabasePool;
  private connections: Map<string, any> = new Map();
  
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool();
    }
    return DatabasePool.instance;
  }
  
  getConnection(url: string): any {
    if (!this.connections.has(url)) {
      this.connections.set(url, neon(url));
    }
    return this.connections.get(url);
  }
  
  clearConnections(): void {
    this.connections.clear();
  }
}

// Create database connection with error handling
export function createDatabaseConnection(config?: Partial<DatabaseConfig>): any {
  const dbUrl = config?.url || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('Database URL is required. Set DATABASE_URL environment variable or provide url in config.');
  }
  
  // Validate URL format
  try {
    new URL(dbUrl);
  } catch (error) {
    throw new Error('Invalid database URL format. Expected: postgresql://user:pass@host:port/db');
  }
  
  const pool = DatabasePool.getInstance();
  return pool.getConnection(dbUrl);
}

// Test database connection
export async function testDatabaseConnection(sql?: any): Promise<boolean> {
  try {
    const connection = sql || createDatabaseConnection();
    await connection`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Execute query with retry logic
export async function executeQuery<T = any>(
  sql: any,
  query: (sql: any) => Promise<T>,
  retryAttempts: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await query(sql);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }
      
      if (attempt < retryAttempts) {
        console.warn(`Query attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

// Check if error should not be retried
function isNonRetryableError(error: any): boolean {
  const nonRetryableErrors = [
    'syntax error',
    'permission denied',
    'relation does not exist',
    'column does not exist',
    'duplicate key value',
    'foreign key constraint',
    'check constraint'
  ];
  
  const errorMessage = error?.message?.toLowerCase() || '';
  return nonRetryableErrors.some(pattern => errorMessage.includes(pattern));
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  indexesExist: boolean;
  error?: string;
}> {
  try {
    const sql = createDatabaseConnection();
    
    // Test basic connection
    await sql`SELECT 1 as test`;
    
    // Check if required tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('questions', 'ratings', 'contacts')
      AND table_schema = 'public'
    `;
    
    const requiredTables = ['questions', 'ratings', 'contacts'];
    const existingTables = tables.map((t: any) => t.table_name);
    const tablesExist = requiredTables.every(table => existingTables.includes(table));
    
    // Check if indexes exist
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE indexname IN ('idx_questions_tsv', 'idx_questions_slug', 'idx_ratings_slug')
      AND schemaname = 'public'
    `;
    
    const requiredIndexes = ['idx_questions_tsv', 'idx_questions_slug', 'idx_ratings_slug'];
    const existingIndexes = indexes.map((i: any) => i.indexname);
    const indexesExist = requiredIndexes.every(index => existingIndexes.includes(index));
    
    return {
      connected: true,
      tablesExist,
      indexesExist
    };
    
  } catch (error) {
    return {
      connected: false,
      tablesExist: false,
      indexesExist: false,
      error: (error as Error).message
    };
  }
}

// Environment configuration validation
export function validateDatabaseEnvironment(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = ['DATABASE_URL'];
  const optional = ['HASH_SALT', 'REINDEX_TOKEN'];
  
  const missing = required.filter(env => !process.env[env]);
  const warnings = optional.filter(env => !process.env[env]);
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

// Transaction wrapper
export async function withTransaction<T>(
  sql: any,
  callback: (sql: any) => Promise<T>
): Promise<T> {
  try {
    await sql`BEGIN`;
    const result = await callback(sql);
    await sql`COMMIT`;
    return result;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }
}

// Common database operations
export const DatabaseOperations = {
  // Get question by slug with rating data
  async getQuestionWithRatings(sql: any, slug: string) {
    return executeQuery(sql, async (sql) => {
      const [question] = await sql`
        SELECT q.*, 
               COALESCE(r.rating, 0) as user_rating
        FROM questions q
        LEFT JOIN ratings r ON r.slug = q.slug AND r.user_hash = ${slug}
        WHERE q.slug = ${slug}
        LIMIT 1
      `;
      return question;
    });
  },
  
  // Update rating with aggregate recalculation
  async updateRating(sql: any, slug: string, userHash: string, rating: number) {
    return withTransaction(sql, async (sql) => {
      // Upsert rating
      await sql`
        INSERT INTO ratings (slug, user_hash, rating)
        VALUES (${slug}, ${userHash}, ${rating})
        ON CONFLICT (slug, user_hash) 
        DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
      `;
      
      // Update aggregates
      await sql`
        UPDATE questions q SET
          rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${slug}),
          rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${slug}),
          updated_at = NOW()
        WHERE q.slug = ${slug}
      `;
      
      // Return updated aggregates
      const [result] = await sql`
        SELECT rating_avg::float AS average, rating_count::int AS count 
        FROM questions WHERE slug = ${slug} LIMIT 1
      `;
      
      return result;
    });
  },
  
  // Search questions with pagination
  async searchQuestions(sql: any, query: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    return executeQuery(sql, async (sql) => {
      let results, countResult;
      
      if (query.length >= 3) {
        // Use full-text search for longer queries
        results = await sql`
          SELECT slug, question, short_answer, tags,
                 ts_rank(search_vector, to_tsquery('simple', ${query + ':*'})) as rank
          FROM questions 
          WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
          ORDER BY rank DESC, pub_date DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        countResult = await sql`
          SELECT COUNT(*) as total
          FROM questions 
          WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
        `;
      } else {
        // Use ILIKE for short queries
        results = await sql`
          SELECT slug, question, short_answer, tags, 0 as rank
          FROM questions 
          WHERE question ILIKE ${`%${query}%`} OR short_answer ILIKE ${`%${query}%`}
          ORDER BY pub_date DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        countResult = await sql`
          SELECT COUNT(*) as total
          FROM questions 
          WHERE question ILIKE ${`%${query}%`} OR short_answer ILIKE ${`%${query}%`}
        `;
      }
      
      const total = countResult[0]?.total || 0;
      const hasMore = offset + results.length < total;
      
      return {
        results,
        pagination: {
          page,
          limit,
          total: parseInt(total),
          hasMore
        }
      };
    });
  }
};

// Export default connection for convenience
export const sql = createDatabaseConnection();