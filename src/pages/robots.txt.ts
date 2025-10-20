export async function GET() {
  const siteUrl = 'https://soaale.com';
  
  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_astro/
Disallow: /admin/

# Crawl delay for better server performance
Crawl-delay: 1

# Sitemap location
Sitemap: ${siteUrl}/sitemap-index.xml

# Additional sitemaps
Sitemap: ${siteUrl}/rss.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    },
  });
}