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
    react({
      // Optimize React for production
      experimentalReactChildren: true
    })
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
      // Optimize bundle splitting
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
    contentCollectionCache: true,
  },
  
  // Build optimizations
  build: {
    // Inline small assets for better performance
    inlineStylesheets: 'auto',
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
