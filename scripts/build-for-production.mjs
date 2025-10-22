#!/usr/bin/env node

/**
 * Build script for production deployment
 * Ensures search index is available as fallback
 */

import fs from 'fs/promises';
import path from 'path';

async function buildForProduction() {
  try {
    console.log('🏗️  Preparing production build...\n');
    
    // Ensure data directory exists in public
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    try {
      await fs.access(publicDataDir);
    } catch {
      await fs.mkdir(publicDataDir, { recursive: true });
      console.log('✅ Created public/data directory');
    }
    
    // Copy search index to public directory for fallback
    const sourceIndex = path.join(process.cwd(), 'data', 'search-index.json');
    const targetIndex = path.join(publicDataDir, 'search-index.json');
    
    try {
      await fs.copyFile(sourceIndex, targetIndex);
      console.log('✅ Copied search index to public directory');
    } catch (error) {
      console.warn('⚠️  Could not copy search index:', error.message);
      
      // Create minimal fallback index
      const fallbackIndex = {
        questions: [],
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(targetIndex, JSON.stringify(fallbackIndex, null, 2));
      console.log('✅ Created fallback search index');
    }
    
    // Create a static search index in src for build-time inclusion
    const srcDataDir = path.join(process.cwd(), 'src', 'data');
    try {
      await fs.access(srcDataDir);
    } catch {
      await fs.mkdir(srcDataDir, { recursive: true });
    }
    
    const srcIndexPath = path.join(srcDataDir, 'search-index.json');
    try {
      await fs.copyFile(sourceIndex, srcIndexPath);
      console.log('✅ Copied search index to src/data for build inclusion');
    } catch (error) {
      console.warn('⚠️  Could not copy to src/data:', error.message);
    }
    
    console.log('\n🎉 Production build preparation completed!');
    console.log('Search will work with database in production and fallback to file-based search if needed.');
    
  } catch (error) {
    console.error('❌ Error preparing production build:', error);
    process.exit(1);
  }
}

buildForProduction();