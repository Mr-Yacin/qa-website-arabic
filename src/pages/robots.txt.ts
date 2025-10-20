export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}