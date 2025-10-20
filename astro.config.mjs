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
    tailwind(),
    sitemap(),
    react()
  ],
  adapter: vercel(),
});
