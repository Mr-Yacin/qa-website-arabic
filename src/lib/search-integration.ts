import type { AstroIntegration } from 'astro';
import { updateSearchIndex } from './search.js';

/**
 * Astro integration to automatically update search index
 */
export function searchIndexIntegration(): AstroIntegration {
  return {
    name: 'search-index',
    hooks: {
      'astro:build:start': async () => {
        console.log('Updating search index...');
        try {
          await updateSearchIndex();
          console.log('Search index updated successfully');
        } catch (error) {
          console.error('Failed to update search index:', error);
        }
      },
      'astro:server:start': async () => {
        console.log('Updating search index for development...');
        try {
          await updateSearchIndex();
          console.log('Search index updated successfully');
        } catch (error) {
          console.error('Failed to update search index:', error);
        }
      },
    },
  };
}