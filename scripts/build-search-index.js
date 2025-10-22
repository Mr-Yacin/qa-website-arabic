#!/usr/bin/env node

/**
 * Build search index script
 * This script generates the search index from content collections
 * and saves it to data/search-index.json
 */

const { updateSearchIndex } = require('../dist/lib/search.js');

async function main() {
  try {
    console.log('Building search index...');
    await updateSearchIndex();
    console.log('Search index built successfully!');
  } catch (error) {
    console.error('Failed to build search index:', error);
    process.exit(1);
  }
}

main();