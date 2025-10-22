import type { APIRoute } from 'astro';
import { loadRatings, saveRatings, generateUserId } from '../../lib/dataStorage.js';

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  try {
    // Get slug from query parameters
    const slug = url.searchParams.get('slug');
    
    // Parse request body
    const body = await request.json();
    const rating = body.rating;

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

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
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

    // Generate user ID from IP and User-Agent for privacy-friendly identification
    const userAgent = request.headers.get('user-agent') || '';
    const ip = clientAddress || '127.0.0.1';
    const userId = generateUserId(ip, userAgent);

    // Load existing ratings
    const ratingsData = await loadRatings();
    
    // Initialize question rating data if it doesn't exist
    if (!ratingsData[slug]) {
      ratingsData[slug] = {
        ratings: {},
        average: 0,
        count: 0,
        lastUpdated: new Date()
      };
    }
    
    // Update or add user's rating
    const wasUpdate = userId in ratingsData[slug].ratings;
    ratingsData[slug].ratings[userId] = rating;
    
    // Recalculate average and count
    const ratings = Object.values(ratingsData[slug].ratings);
    ratingsData[slug].average = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    ratingsData[slug].count = ratings.length;
    ratingsData[slug].lastUpdated = new Date();
    
    // Save updated ratings to file
    await saveRatings(ratingsData);
    
    console.log(`Rating ${wasUpdate ? 'updated' : 'submitted'}: ${rating} stars for question: ${slug} by user: ${userId}`);

    // Return success response with updated data
    return new Response(
      JSON.stringify({ 
        ok: true,
        message: wasUpdate ? 'تم تحديث تقييمك بنجاح' : 'تم إرسال تقييمك بنجاح', // Rating updated/submitted successfully in Arabic
        average: ratingsData[slug].average,
        count: ratingsData[slug].count,
        userRating: rating,
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