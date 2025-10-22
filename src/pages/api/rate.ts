import type { APIRoute } from 'astro';
import { createDatabaseConnection, withTransaction } from '../../lib/database.js';
import crypto from 'crypto';

// Privacy-friendly user identification using hashed IP + User-Agent
function generateUserHash(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || '';
  const salt = process.env.HASH_SALT || 'default-salt';
  
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${salt}`)
    .digest('hex')
    .slice(0, 16);
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    // Get slug from query parameters
    const slug = url.searchParams.get('slug');
    
    // Parse request body
    const body = await request.json();
    const rating = body.rating;
    const ratingNum = Number(rating);

    // Validate parameters
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'معامل السؤال مطلوب' // Missing slug parameter in Arabic
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'قيمة التقييم غير صحيحة. يجب أن تكون بين 1 و 5' // Invalid rating in Arabic
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate privacy-friendly user hash
    const userHash = generateUserHash(request);
    
    // Get database connection
    const sql = createDatabaseConnection();

    // Check if question exists
    const [questionExists] = await sql`
      SELECT slug FROM questions WHERE slug = ${slug} LIMIT 1
    `;
    
    if (!questionExists) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'السؤال غير موجود' // Question not found in Arabic
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if this is an update (user has already rated this question)
    const [existingRating] = await sql`
      SELECT rating FROM ratings WHERE slug = ${slug} AND user_hash = ${userHash} LIMIT 1
    `;
    const wasUpdate = Boolean(existingRating);

    // Perform atomic transaction for rating update and aggregate recalculation
    const result = await withTransaction(sql, async (sql) => {
      // Upsert rating in normalized ratings table
      await sql`
        INSERT INTO ratings (slug, user_hash, rating)
        VALUES (${slug}, ${userHash}, ${ratingNum})
        ON CONFLICT (slug, user_hash) 
        DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
      `;

      // Update aggregates in questions table
      await sql`
        UPDATE questions q SET
          rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${slug}),
          rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${slug}),
          updated_at = NOW()
        WHERE q.slug = ${slug}
      `;

      // Return updated aggregates
      const [aggregates] = await sql`
        SELECT rating_avg::float AS average, rating_count::int AS count 
        FROM questions WHERE slug = ${slug} LIMIT 1
      `;

      return aggregates;
    });
    
    console.log(`Rating ${wasUpdate ? 'updated' : 'submitted'}: ${ratingNum} stars for question: ${slug} by user: ${userHash}`);

    // Return success response with updated data
    return new Response(
      JSON.stringify({ 
        ok: true,
        message: wasUpdate ? 'تم تحديث تقييمك بنجاح' : 'تم إرسال تقييمك بنجاح', // Rating updated/submitted successfully in Arabic
        average: result?.average || 0,
        count: result?.count || 0,
        userRating: ratingNum,
        wasUpdate
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );

  } catch (error) {
    console.error('Error processing rating:', error);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'خطأ في الخادم' // Server error in Arabic
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};