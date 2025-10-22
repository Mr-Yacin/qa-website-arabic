# Database Setup for Search Functionality

## Overview

The Arabic Q&A site now uses PostgreSQL with full-text search capabilities for enhanced search performance and scalability.

## Database Configuration

### Environment Variables

Set the following environment variable to enable database functionality:

```bash
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Development Mode

If `DATABASE_URL` is not set:
- Search API will return a 503 error with a helpful message
- Search results page will show "البحث غير متاح حالياً" (Search not available)
- Users can still browse content through direct navigation

### Production Mode

With `DATABASE_URL` configured:
- Full PostgreSQL full-text search with Arabic support
- Pagination support for search results
- Relevance scoring using `ts_rank`
- Fallback ILIKE queries for short search terms

## Database Schema

The search functionality uses:
- `questions` table with `search_vector` column (tsvector)
- GIN index on `search_vector` for performance
- Automatic search vector updates via database triggers

## Setup Scripts

Run these scripts to set up the database:

1. `scripts/setup-neon-db.mjs` - Creates tables and indexes
2. `scripts/migrate-to-unified-schema.mjs` - Migrates existing data
3. Use `/api/reindex` endpoint to sync content from markdown files

## Search Features

- **Full-text search**: Uses PostgreSQL tsvector for Arabic text
- **Relevance scoring**: Results ranked by ts_rank
- **Pagination**: Configurable page size with navigation
- **Fallback queries**: ILIKE for short search terms (< 3 characters)
- **Error handling**: Graceful degradation when database unavailable

## API Endpoints

- `GET /api/search?q=query&page=1&limit=10` - Search with pagination
- `POST /api/reindex` - Sync content from markdown to database
- `GET /api/avg?slug=question-slug` - Get question rating average