import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Check environment variables (safely)
    const envCheck = {
      hasDatabaseUrl: !!(import.meta.env.DATABASE_URL || process.env.DATABASE_URL),
      hasResendKey: !!(import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY),
      hasAdminEmail: !!(import.meta.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL),
      hasFromEmail: !!(import.meta.env.FROM_EMAIL || process.env.FROM_EMAIL),
      isVercel: !!(import.meta.env.VERCEL || process.env.VERCEL),
      nodeEnv: import.meta.env.NODE_ENV || process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    // Test database connection if available
    let dbStatus = 'not_configured';
    const DATABASE_URL = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
    
    if (DATABASE_URL) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(DATABASE_URL);
        await sql`SELECT 1 as test`;
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'connection_failed';
        console.error('Database connection test failed:', error);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        environment: envCheck,
        database: {
          status: dbStatus,
          url_length: DATABASE_URL?.length || 0
        }
      }, null, 2),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      }
    );

  } catch (error) {
    console.error('Debug API error:', error);
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};