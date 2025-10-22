/**
 * Content synchronization utilities for markdown to database sync
 */

import type { CollectionEntry } from 'astro:content';
import { createDatabaseConnection, withTransaction, executeQuery } from './database.js';

// Database question record interface
interface DatabaseQuestion {
  slug: string;
  question: string;
  short_answer: string;
  content: string;
  tags: string[];
  difficulty: string;
  pub_date: string;
  updated_date?: string;
  hero_image?: string;
  updated_at: string;
}

// Content synchronization interfaces
export interface ContentSyncOperation {
  operation: 'insert' | 'update' | 'delete';
  slug: string;
  data?: QuestionData;
  searchVector?: string;
}

export interface QuestionData {
  question: string;
  shortAnswer: string;
  content: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
}

export interface SyncBatch {
  operations: ContentSyncOperation[];
  timestamp: Date;
  source: 'markdown' | 'api' | 'migration';
}

export interface SyncResult {
  processed: number;
  errors: number;
  total: number;
  errorDetails?: Array<{slug: string, error: string}>;
}

/**
 * Extract question data from Astro content collection entry
 */
export function extractQuestionData(question: CollectionEntry<'qa'>): QuestionData {
  return {
    question: question.data.question,
    shortAnswer: question.data.shortAnswer,
    content: question.body,
    tags: question.data.tags,
    difficulty: question.data.difficulty || 'easy',
    pubDate: question.data.pubDate,
    updatedDate: question.data.updatedDate,
    heroImage: question.data.heroImage
  };
}

/**
 * Generate search vector content from question data
 */
export function generateSearchContent(data: QuestionData): string {
  return [
    data.question,
    data.shortAnswer,
    data.content
  ].join(' ');
}

/**
 * Create sync operation from content collection entry
 */
export function createSyncOperation(
  question: CollectionEntry<'qa'>, 
  operation: 'insert' | 'update' = 'insert'
): ContentSyncOperation {
  const data = extractQuestionData(question);
  const searchVector = generateSearchContent(data);
  
  return {
    operation,
    slug: question.slug,
    data,
    searchVector
  };
}

/**
 * Upsert single question into database with conflict resolution
 */
export async function upsertQuestion(
  sql: any, 
  slug: string, 
  data: QuestionData, 
  searchContent?: string
): Promise<void> {
  const content = searchContent || generateSearchContent(data);
  
  await executeQuery(sql, async (sql) => {
    await sql`
      INSERT INTO questions (
        slug, question, short_answer, content, tags, difficulty, 
        pub_date, updated_date, hero_image, search_vector
      ) VALUES (
        ${slug},
        ${data.question},
        ${data.shortAnswer},
        ${data.content},
        ${data.tags},
        ${data.difficulty},
        ${data.pubDate},
        ${data.updatedDate || null},
        ${data.heroImage || null},
        to_tsvector('simple', ${content})
      )
      ON CONFLICT (slug) DO UPDATE SET
        question = EXCLUDED.question,
        short_answer = EXCLUDED.short_answer,
        content = EXCLUDED.content,
        tags = EXCLUDED.tags,
        difficulty = EXCLUDED.difficulty,
        pub_date = EXCLUDED.pub_date,
        updated_date = EXCLUDED.updated_date,
        hero_image = EXCLUDED.hero_image,
        search_vector = EXCLUDED.search_vector,
        updated_at = NOW()
    `;
  });
}

/**
 * Batch process sync operations with transaction support
 */
export async function processSyncBatch(
  operations: ContentSyncOperation[],
  batchSize: number = 10
): Promise<SyncResult> {
  const sql = createDatabaseConnection();
  
  let processed = 0;
  let errors = 0;
  const errorDetails: Array<{slug: string, error: string}> = [];

  // Process operations in batches for better performance
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    
    try {
      await withTransaction(sql, async (sql) => {
        for (const operation of batch) {
          try {
            switch (operation.operation) {
              case 'insert':
              case 'update':
                if (!operation.data) {
                  throw new Error('Data required for insert/update operation');
                }
                await upsertQuestion(sql, operation.slug, operation.data, operation.searchVector);
                break;
                
              case 'delete':
                await executeQuery(sql, async (sql) => {
                  await sql`DELETE FROM questions WHERE slug = ${operation.slug}`;
                });
                break;
                
              default:
                throw new Error(`Unknown operation: ${operation.operation}`);
            }
            
            processed++;
          } catch (err) {
            const error = err as Error;
            console.error(`Error processing operation for ${operation.slug}:`, error);
            errors++;
            errorDetails.push({
              slug: operation.slug,
              error: error.message
            });
          }
        }
      });
    } catch (batchError) {
      console.error('Batch processing failed:', batchError);
      // Individual errors are already tracked above
    }
  }

  return {
    processed,
    errors,
    total: operations.length,
    ...(errors > 0 && { errorDetails })
  };
}

/**
 * Synchronize content collection to database
 */
export async function syncContentCollection(
  questions: CollectionEntry<'qa'>[],
  options: {
    batchSize?: number;
    deleteOrphaned?: boolean;
  } = {}
): Promise<SyncResult> {
  const { batchSize = 10, deleteOrphaned = false } = options;
  
  // Create sync operations for all questions
  const operations = questions.map(question => 
    createSyncOperation(question, 'update') // Use update to handle both insert and update
  );

  // Handle orphaned records if requested
  if (deleteOrphaned) {
    const sql = createDatabaseConnection();
    const currentSlugs = questions.map(q => q.slug);
    
    try {
      // Find questions in database that are not in current content collection
      const orphanedQuestions = await executeQuery(sql, async (sql) => {
        if (currentSlugs.length === 0) {
          return await sql`SELECT slug FROM questions`;
        }
        return await sql`
          SELECT slug FROM questions 
          WHERE slug NOT IN (${sql(currentSlugs)})
        `;
      });

      // Add delete operations for orphaned questions
      const deleteOperations = orphanedQuestions.map((row: any) => ({
        operation: 'delete' as const,
        slug: row.slug
      }));

      operations.push(...deleteOperations);
    } catch (error) {
      console.warn('Failed to check for orphaned questions:', error);
    }
  }

  return await processSyncBatch(operations, batchSize);
}

/**
 * Get database statistics for sync monitoring
 */
export async function getDatabaseStats(): Promise<{
  totalQuestions: number;
  questionsWithRatings: number;
  totalRatings: number;
  lastUpdated?: Date;
}> {
  const sql = createDatabaseConnection();
  
  return await executeQuery(sql, async (sql) => {
    const [stats] = await sql`
      SELECT 
        (SELECT COUNT(*) FROM questions) as total_questions,
        (SELECT COUNT(DISTINCT slug) FROM ratings) as questions_with_ratings,
        (SELECT COUNT(*) FROM ratings) as total_ratings,
        (SELECT MAX(updated_at) FROM questions) as last_updated
    `;
    
    return {
      totalQuestions: parseInt(stats.total_questions) || 0,
      questionsWithRatings: parseInt(stats.questions_with_ratings) || 0,
      totalRatings: parseInt(stats.total_ratings) || 0,
      lastUpdated: stats.last_updated ? new Date(stats.last_updated) : undefined
    };
  });
}

/**
 * Validate content collection data before sync
 */
export function validateContentCollection(questions: CollectionEntry<'qa'>[]): {
  valid: boolean;
  errors: Array<{slug: string, issues: string[]}>;
} {
  const errors: Array<{slug: string, issues: string[]}> = [];
  
  for (const question of questions) {
    const issues: string[] = [];
    
    // Validate required fields
    if (!question.data.question || question.data.question.length < 10) {
      issues.push('Question must be at least 10 characters long');
    }
    
    if (!question.data.shortAnswer || question.data.shortAnswer.length < 20) {
      issues.push('Short answer must be at least 20 characters long');
    }
    
    if (question.data.shortAnswer && question.data.shortAnswer.length > 155) {
      issues.push('Short answer must not exceed 155 characters for SEO');
    }
    
    if (!question.data.pubDate) {
      issues.push('Publication date is required');
    }
    
    if (!question.data.tags || question.data.tags.length === 0) {
      issues.push('At least one tag is required');
    }
    
    if (!question.body || question.body.trim().length === 0) {
      issues.push('Question content cannot be empty');
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(question.slug)) {
      issues.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    
    if (issues.length > 0) {
      errors.push({
        slug: question.slug,
        issues
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create sync batch from content collection with validation
 */
export async function createSyncBatch(
  questions: CollectionEntry<'qa'>[],
  source: 'markdown' | 'api' | 'migration' = 'markdown'
): Promise<{
  batch: SyncBatch;
  validation: ReturnType<typeof validateContentCollection>;
}> {
  const validation = validateContentCollection(questions);
  
  // Only create operations for valid questions
  const validQuestions = questions.filter(q => 
    !validation.errors.some(error => error.slug === q.slug)
  );
  
  const operations = validQuestions.map(question => 
    createSyncOperation(question, 'update')
  );
  
  const batch: SyncBatch = {
    operations,
    timestamp: new Date(),
    source
  };
  
  return {
    batch,
    validation
  };
}

/**
 * Execute sync batch with comprehensive error handling
 */
export async function executeSyncBatch(batch: SyncBatch): Promise<SyncResult & {
  batchInfo: {
    source: string;
    timestamp: Date;
    operationCount: number;
  };
}> {
  const result = await processSyncBatch(batch.operations);
  
  return {
    ...result,
    batchInfo: {
      source: batch.source,
      timestamp: batch.timestamp,
      operationCount: batch.operations.length
    }
  };
}
/*
*
 * Utility functions for content synchronization monitoring and debugging
 */

/**
 * Compare content collection with database to find differences
 */
export async function compareContentWithDatabase(
  questions: CollectionEntry<'qa'>[]
): Promise<{
  inContentOnly: string[];
  inDatabaseOnly: string[];
  modified: Array<{slug: string, reason: string}>;
  identical: string[];
}> {
  const sql = createDatabaseConnection();
  
  const contentSlugs = new Set(questions.map(q => q.slug));
  
  // Get all questions from database
  const dbQuestions = await executeQuery(sql, async (sql) => {
    return await sql`
      SELECT slug, question, short_answer, content, tags, difficulty, 
             pub_date, updated_date, hero_image, updated_at
      FROM questions
    `;
  }) as DatabaseQuestion[];
  
  const dbSlugs = new Set(dbQuestions.map(q => q.slug));
  const dbQuestionMap = new Map(dbQuestions.map(q => [q.slug, q]));
  
  const inContentOnly: string[] = Array.from(contentSlugs).filter(slug => !dbSlugs.has(slug));
  const inDatabaseOnly: string[] = Array.from(dbSlugs).filter(slug => !contentSlugs.has(slug));
  const modified: Array<{slug: string, reason: string}> = [];
  const identical: string[] = [];
  
  // Check for modifications in common questions
  for (const question of questions) {
    if (dbSlugs.has(question.slug)) {
      const dbQuestion = dbQuestionMap.get(question.slug);
      if (!dbQuestion) continue;
      
      const reasons: string[] = [];
      
      if (dbQuestion.question !== question.data.question) {
        reasons.push('question text changed');
      }
      if (dbQuestion.short_answer !== question.data.shortAnswer) {
        reasons.push('short answer changed');
      }
      if (dbQuestion.content !== question.body) {
        reasons.push('content changed');
      }
      if (JSON.stringify(dbQuestion.tags) !== JSON.stringify(question.data.tags)) {
        reasons.push('tags changed');
      }
      if (dbQuestion.difficulty !== (question.data.difficulty || 'easy')) {
        reasons.push('difficulty changed');
      }
      if (dbQuestion.hero_image !== (question.data.heroImage || null)) {
        reasons.push('hero image changed');
      }
      
      // Compare dates (allowing for timezone differences)
      const dbPubDate = new Date(dbQuestion.pub_date).getTime();
      const contentPubDate = question.data.pubDate.getTime();
      if (Math.abs(dbPubDate - contentPubDate) > 1000) { // 1 second tolerance
        reasons.push('publication date changed');
      }
      
      if (reasons.length > 0) {
        modified.push({
          slug: question.slug,
          reason: reasons.join(', ')
        });
      } else {
        identical.push(question.slug);
      }
    }
  }
  
  return {
    inContentOnly,
    inDatabaseOnly,
    modified,
    identical
  };
}

/**
 * Generate sync report for monitoring and debugging
 */
export async function generateSyncReport(
  questions: CollectionEntry<'qa'>[]
): Promise<{
  summary: {
    totalContent: number;
    totalDatabase: number;
    needsSync: boolean;
    lastSync?: Date;
  };
  differences: Awaited<ReturnType<typeof compareContentWithDatabase>>;
  validation: ReturnType<typeof validateContentCollection>;
  dbStats: Awaited<ReturnType<typeof getDatabaseStats>>;
}> {
  const [differences, validation, dbStats] = await Promise.all([
    compareContentWithDatabase(questions),
    Promise.resolve(validateContentCollection(questions)),
    getDatabaseStats()
  ]);
  
  const needsSync = 
    differences.inContentOnly.length > 0 ||
    differences.inDatabaseOnly.length > 0 ||
    differences.modified.length > 0;
  
  return {
    summary: {
      totalContent: questions.length,
      totalDatabase: dbStats.totalQuestions,
      needsSync,
      lastSync: dbStats.lastUpdated
    },
    differences,
    validation,
    dbStats
  };
}

/**
 * Dry run sync to preview changes without applying them
 */
export async function previewSync(
  questions: CollectionEntry<'qa'>[]
): Promise<{
  operations: ContentSyncOperation[];
  report: Awaited<ReturnType<typeof generateSyncReport>>;
  estimatedChanges: {
    inserts: number;
    updates: number;
    deletes: number;
  };
}> {
  const report = await generateSyncReport(questions);
  
  const operations: ContentSyncOperation[] = [];
  
  // Add insert operations for content-only questions
  for (const slug of report.differences.inContentOnly) {
    const question = questions.find(q => q.slug === slug);
    if (question) {
      operations.push(createSyncOperation(question, 'insert'));
    }
  }
  
  // Add update operations for modified questions
  for (const { slug } of report.differences.modified) {
    const question = questions.find(q => q.slug === slug);
    if (question) {
      operations.push(createSyncOperation(question, 'update'));
    }
  }
  
  // Note: We don't automatically add delete operations for safety
  // They would need to be explicitly requested
  
  const estimatedChanges = {
    inserts: report.differences.inContentOnly.length,
    updates: report.differences.modified.length,
    deletes: 0 // Not included in automatic sync
  };
  
  return {
    operations,
    report,
    estimatedChanges
  };
}