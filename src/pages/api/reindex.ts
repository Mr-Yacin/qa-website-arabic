/**
 * Content reindexing API endpoint
 * POST /api/reindex - Synchronizes markdown content to database
 */

import type { APIRoute } from 'astro';
import { createDatabaseConnection } from '../../lib/database.js';
import { getCollection } from 'astro:content';
import { 
  syncContentCollection, 
  validateContentCollection, 
  getDatabaseStats 
} from '../../lib/contentSync.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify authorization (token-based authentication)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REINDEX_TOKEN;
    
    if (!expectedToken) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'Reindex token not configured on server' 
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'Unauthorized - Invalid or missing token' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create database connection
    const sql = createDatabaseConnection();
    
    // Test database connection
    try {
      await sql`SELECT 1 as test`;
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'Database connection failed',
          error: process.env.NODE_ENV === 'development' ? (dbError as Error).message : undefined
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get all questions from Astro content collections
    let questions;
    try {
      questions = await getCollection('qa');
    } catch (contentError) {
      console.error('Failed to load content collection:', contentError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'Failed to load content collection',
          error: process.env.NODE_ENV === 'development' ? (contentError as Error).message : undefined
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate content collection before processing
    const validation = validateContentCollection(questions);
    
    if (!validation.valid && validation.errors.length > 0) {
      console.warn('Content validation issues found:', validation.errors);
      
      // In development, return validation errors
      if (process.env.NODE_ENV === 'development') {
        return new Response(
          JSON.stringify({ 
            ok: false, 
            message: 'Content validation failed',
            validationErrors: validation.errors
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Synchronize content collection to database
    const syncResult = await syncContentCollection(questions, {
      batchSize: 10,
      deleteOrphaned: false // Don't delete orphaned records by default
    });

    // Get updated database statistics
    const dbStats = await getDatabaseStats();

    // Return success response with comprehensive statistics
    const response = {
      ok: true,
      processed: syncResult.processed,
      errors: syncResult.errors,
      total: syncResult.total,
      message: `تم فهرسة ${syncResult.processed} سؤال بنجاح من أصل ${syncResult.total}`,
      statistics: {
        totalQuestionsInDb: dbStats.totalQuestions,
        questionsWithRatings: dbStats.questionsWithRatings,
        totalRatings: dbStats.totalRatings,
        lastUpdated: dbStats.lastUpdated
      },
      validation: {
        hasIssues: !validation.valid,
        issueCount: validation.errors.length
      },
      ...(syncResult.errors > 0 && process.env.NODE_ENV === 'development' && { 
        errorDetails: syncResult.errorDetails 
      }),
      ...(validation.errors.length > 0 && process.env.NODE_ENV === 'development' && { 
        validationErrors: validation.errors 
      })
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Reindex API error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'خطأ في إعادة الفهرسة',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

export const prerender = false;