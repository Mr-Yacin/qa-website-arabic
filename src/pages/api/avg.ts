import type { APIRoute } from 'astro';
import { loadRatings, generateUserId } from '../../lib/dataStorage.js';

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
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

    // Load ratings data from persistent storage
    const ratingsData = await loadRatings();
    
    // Get user ID to check if they have rated this question
    const userAgent = request.headers.get('user-agent') || '';
    const ip = clientAddress || '127.0.0.1';
    const userId = generateUserId(ip, userAgent);
    
    // Get rating data for this question
    const questionRating = ratingsData[slug];
    
    let avg = null;
    let count = 0;
    let userRating = null;
    
    if (questionRating) {
      avg = questionRating.average;
      count = questionRating.count;
      
      // Check if current user has rated this question
      if (userId in questionRating.ratings) {
        userRating = questionRating.ratings[userId];
      }
    }
    
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