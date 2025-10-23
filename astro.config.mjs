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
  
  // Performance optimizations for critical request chains
  vite: {
    build: {
      // Disable CSS code splitting to prevent 404 issues
      cssCodeSplit: false,
      // Optimize chunk splitting to reduce critical path
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Create separate chunks for different types of modules
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@astrojs')) {
                return 'astro-runtime';
              }
              // Group other vendor libraries
              return 'vendor';
            }
            // Keep SearchBanner as a separate chunk since it's not critical
            if (id.includes('SearchBanner')) {
              return 'search';
            }
            // Keep analytics as separate non-critical chunk
            if (id.includes('analytics')) {
              return 'analytics';
            }
          },
          // Optimize chunk loading
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      // Reduce bundle size
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      }
    },
    ssr: {
      // Optimize SSR performance
      noExternal: ['@astrojs/react']
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@astrojs/client']
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
