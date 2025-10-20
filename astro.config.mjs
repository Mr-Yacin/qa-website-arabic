// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://soaale.com',
  trailingSlash: 'never',
  output: 'server',
  integrations: [
    tailwind({
      // Optimize Tailwind for production
      applyBaseStyles: false, // We handle base styles manually
    }),
    sitemap({
      // Enhanced sitemap configuration
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'ar',
        locales: {
          ar: 'ar-SA'
        }
      }
    }),
    react()
  ],
  adapter: vercel({
    // Vercel-specific optimizations
    webAnalytics: {
      enabled: true
    },
    speedInsights: {
      enabled: true
    }
  }),
  
  // Performance optimizations
  vite: {
    build: {
      // Disable CSS code splitting to prevent 404 issues
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          }
        }
      }
    },
    ssr: {
      // Optimize SSR performance
      noExternal: ['@astrojs/react']
    }
  },
  
  // Experimental features for better performance
  experimental: {
    // contentCollectionCache: true, // Removed as it might be outdated
  },
  
  // Build optimizations
  build: {
    // Force inline all stylesheets to prevent 404 errors
    inlineStylesheets: 'always',
  },
  
  // Image optimization
  image: {
    // Configure image optimization
    domains: ['soaale.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.soaale.com'
      }
    ]
  }
});
