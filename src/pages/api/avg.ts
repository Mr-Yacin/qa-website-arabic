import type { APIRoute } from 'astro';
import { createDatabaseConnection } from '../../lib/database.js';
import crypto from 'crypto';

// Privacy-friendly user identification using hashed IP + User-Agent
function generateUserHash(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';
  const salt = process.env.HASH_SALT || 'default-salt';
  
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${salt}`)
    .digest('hex')
    .slice(0, 16);
}

export const GET: APIRoute = async ({ url, request }) => {
  try {
    // Get slug from query parameters
    const slug = url.searchParams.get('slug');

    // Validate slug parameter
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          avg: null,
          count: 0,
          userRating: null,
          message: 'معامل السؤال مطلوب' // Missing slug parameter in Arabic
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get database connection
    const sql = createDatabaseConnection();
    
    // Generate privacy-friendly user hash
    const userHash = generateUserHash(request);
    
    // Get rating aggregates from questions table and user's current rating
    const questionData = await sql`
      SELECT 
        q.rating_avg::float AS avg,
        q.rating_count::int AS count,
        r.rating AS user_rating
      FROM questions q
      LEFT JOIN ratings r ON r.slug = q.slug AND r.user_hash = ${userHash}
      WHERE q.slug = ${slug}
      LIMIT 1
    `;
    
    const questionResult = questionData[0];
    
    // Check if question exists
    if (!questionResult) {
      return new Response(
        JSON.stringify({ 
          avg: null,
          count: 0,
          userRating: null,
          message: 'السؤال غير موجود' // Question not found in Arabic
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const avg = questionResult.avg || null;
    const count = questionResult.count || 0;
    const userRating = questionResult.user_rating || null;
    
    console.log(`Average rating requested for question: ${slug} - avg: ${avg}, count: ${count}, userRating: ${userRating}`);

    // Return response with caching headers and user's current rating
    return new Response(
      JSON.stringify({ 
        avg,
        count,
        userRating,
        hasRatings: count > 0
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
    console.error('Error fetching average rating:', error);
    
    return new Response(
      JSON.stringify({ 
        avg: null,
        count: 0,
        userRating: null,
        message: 'خطأ في الخادم' // Server error in Arabic
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};