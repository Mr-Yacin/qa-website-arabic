import type { APIRoute } from 'astro';
import { URL } from 'node:url';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || 'موقع الأسئلة والأجوبة';
  const description = url.searchParams.get('description') || 'إجابات شاملة باللغة العربية';

  // Simple HTML escape for SVG content
  function escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  const safeTitle = escapeHTML(title);
  const safeDescription = escapeHTML(description);

  // Create SVG with Arabic text support
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
      </style>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>

    <!-- Content -->
    <g transform="translate(60, 60)">
      <!-- Title -->
      <text x="0" y="80" font-family="Noto Sans Arabic, sans-serif" font-size="48" font-weight="700" fill="white" direction="rtl">
        ${safeTitle.length > 50 ? safeTitle.substring(0, 50) + '...' : safeTitle}
      </text>

      <!-- Description -->
      <text x="0" y="140" font-family="Noto Sans Arabic, sans-serif" font-size="24" font-weight="400" fill="#e0e7ff" direction="rtl">
        ${safeDescription.length > 80 ? safeDescription.substring(0, 80) + '...' : safeDescription}
      </text>

      <!-- Site branding -->
      <text x="0" y="200" font-family="Noto Sans Arabic, sans-serif" font-size="18" fill="#c7d2fe" direction="rtl">
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