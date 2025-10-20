import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    // Get slug from query parameters
    const slug = url.searchParams.get('slug');

    // Validate slug parameter
    if (!slug) {
      return new Response(
        JSON.stringify({ 
          avg: null,
          message: 'Missing slug parameter'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Integrate with database to fetch average rating
    // For now, return null to indicate no data available
    // Future implementation should:
    // 1. Connect to database
    // 2. Query all ratings for the given slug
    // 3. Calculate average rating
    // 4. Return count of total ratings
    // 5. Implement caching for better performance
    
    console.log(`Average rating requested for question: ${slug}`);

    // Return response with caching headers
    return new Response(
      JSON.stringify({ 
        avg: null, // Will be calculated from database in future
        count: 0   // Number of ratings
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
        message: 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};