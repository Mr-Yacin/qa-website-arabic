#!/usr/bin/env node

/**
 * Build script for production deployment
 * Database-first search - no file-based search index needed
 */

import fs from 'fs/promises';
import path from 'path';
//add env
import dotenv from 'dotenv';
dotenv.config();

async function buildForProduction() {
  try {
    console.log('🏗️  Preparing production build...\n');

    
    // Ensure data directory exists in public for other assets
    const publicDataDir = path.join(process.cwd(), 'public', 'data');
    try {
      await fs.access(publicDataDir);
    } catch {
      await fs.mkdir(publicDataDir, { recursive: true });
      console.log('✅ Created public/data directory');
    }
    
    // Verify database configuration for production
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not configured. Search functionality will be limited.');
    } else {
      console.log('✅ Database configuration detected');
    }
    
    console.log('\n🎉 Production build preparation completed!');
    console.log('Search functionality uses database-first approach with PostgreSQL full-text search.');
    
  } catch (error) {
    console.error('❌ Error preparing production build:', error);
    process.exit(1);
  }
}

buildForProduction();