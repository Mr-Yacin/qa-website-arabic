import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url }) => {
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
          message: 'Missing slug parameter' 
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
          message: 'Invalid rating value. Must be between 1 and 5' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Integrate with database to store rating
    // For now, we'll just validate and return success
    // Future implementation should:
    // 1. Connect to database (e.g., PostgreSQL, MongoDB)
    // 2. Store rating with slug, rating value, timestamp, and optional user ID
    // 3. Update average rating calculations
    // 4. Implement rate limiting per IP/user
    
    console.log(`Rating received: ${rating} stars for question: ${slug}`);

    // Return success response
    return new Response(
      JSON.stringify({ 
        ok: true,
        message: 'Rating submitted successfully'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          // Add basic security headers
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );

  } catch (error) {
    console.error('Error processing rating:', error);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};