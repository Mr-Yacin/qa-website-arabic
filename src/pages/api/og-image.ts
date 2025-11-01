import type { APIRoute } from 'astro';
import { URL } from 'node:url';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'موقع الأسئلة والأجوبة';
  const description = url.searchParams.get('description') || 'إجابات شاملة باللغة العربية';

  // HTML escape function for SVG content
  function escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;');
  }

  const safeTitle = escapeHTML(title.length > 50 ? title.substring(0, 50) + '...' : title);
  const safeDescription = escapeHTML(description.length > 80 ? description.substring(0, 80) + '...' : description);

  // Create SVG with Arabic text support
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" stop-opacity="1"/>
        <stop offset="100%" stop-color="#7c3aed" stop-opacity="1"/>
      </linearGradient>
      <style>
        text {
          font-family: Arial, sans-serif;
        }
      </style>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Content -->
    <g transform="translate(60, 60)">
      <!-- Title -->
      <text x="0" y="80" font-size="48" font-weight="700" fill="white">
        ${safeTitle}
      </text>

      <!-- Description -->
      <text x="0" y="140" font-size="24" font-weight="400" fill="#e0e7ff">
        ${safeDescription}
      </text>

      <!-- Site branding -->
      <text x="0" y="200" font-size="18" fill="#c7d2fe">
        موقع الأسئلة والأجوبة
      </text>
    </g>

    <!-- Decorative elements -->
    <circle cx="1000" cy="100" r="60" fill="rgba(255,255,255,0.1)"/>
    <circle cx="950" cy="200" r="40" fill="rgba(255,255,255,0.1)"/>
    <circle cx="1050" cy="180" r="30" fill="rgba(255,255,255,0.1)"/>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
};

export const prerender = false;