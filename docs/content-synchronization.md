# Content Synchronization System

This document explains how to use the new content synchronization system that syncs markdown content from Astro content collections to the PostgreSQL database.

## Overview

The content synchronization system provides:

- **API Endpoint**: `POST /api/reindex` for programmatic content sync
- **Utility Functions**: Comprehensive content sync utilities in `src/lib/contentSync.ts`
- **Manual Script**: `scripts/sync-content-to-db.mjs` for manual synchronization
- **Validation**: Content validation before sync to ensure data integrity
- **Batch Processing**: Efficient batch processing with transaction support

## API Endpoint Usage

### POST /api/reindex

Synchronizes all markdown content from Astro content collections to the database.

**Authentication**: Requires `Authorization: Bearer <REINDEX_TOKEN>` header

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `REINDEX_TOKEN`: Secret token for API authentication

**Example Request**:
```bash
curl -X POST "https://your-site.com/api/reindex" \
  -H "Authorization: Bearer your-reindex-token" \
  -H "Content-Type: application/json"
```

**Response Format**:
```json
{
  "ok": true,
  "processed": 45,
  "errors": 0,
  "total": 45,
  "message": "تم فهرسة 45 سؤال بنجاح من أصل 45",
  "statistics": {
    "totalQuestionsInDb": 45,
    "questionsWithRatings": 12,
    "totalRatings": 28,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "validation": {
    "hasIssues": false,
    "issueCount": 0
  }
}
```

## Manual Script Usage

Use the provided script for manual synchronization during development:

```bash
# Set environment variables
export DATABASE_URL="postgresql://user:pass@host/db"
export REINDEX_TOKEN="your-secret-token"
export SITE_URL="http://localhost:4321"  # Optional, defaults to localhost

# Run synchronization
node scripts/sync-content-to-db.mjs
```

**Script Features**:
- Tests database connection before sync
- Calls the reindex API endpoint
- Displays comprehensive sync results
- Shows validation issues and error details in development

## Content Sync Utilities

The `src/lib/contentSync.ts` module provides utilities for advanced content synchronization:

### Key Functions

#### `syncContentCollection(questions, options)`
Synchronizes an array of content collection entries to the database.

```typescript
import { getCollection } from 'astro:content';
import { syncContentCollection } from '../lib/contentSync.js';

const questions = await getCollection('qa');
const result = await syncContentCollection(questions, {
  batchSize: 10,
  deleteOrphaned: false
});
```

#### `validateContentCollection(questions)`
Validates content collection data before synchronization.

```typescript
import { validateContentCollection } from '../lib/contentSync.js';

const validation = validateContentCollection(questions);
if (!validation.valid) {
  console.log('Validation errors:', validation.errors);
}
```

#### `compareContentWithDatabase(questions)`
Compares content collection with database to identify differences.

```typescript
import { compareContentWithDatabase } from '../lib/contentSync.js';

const differences = await compareContentWithDatabase(questions);
console.log('New questions:', differences.inContentOnly);
console.log('Modified questions:', differences.modified);
```

#### `generateSyncReport(questions)`
Generates a comprehensive sync report for monitoring.

```typescript
import { generateSyncReport } from '../lib/contentSync.js';

const report = await generateSyncReport(questions);
console.log('Sync needed:', report.summary.needsSync);
console.log('Database stats:', report.dbStats);
```

## Automated Synchronization

### GitHub Actions Integration

Create `.github/workflows/sync-content.yml`:

```yaml
name: Sync Content to Database
on:
  push:
    branches: [main]
    paths: ['src/content/qa/**']

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Reindex
        run: |
          curl -X POST "${{ secrets.SITE_URL }}/api/reindex" \
            -H "Authorization: Bearer ${{ secrets.REINDEX_TOKEN }}" \
            -H "Content-Type: application/json"
```

**Required Secrets**:
- `SITE_URL`: Your deployed site URL
- `REINDEX_TOKEN`: Your reindex API token

### Deployment Hooks

Configure your deployment platform to call the reindex API after successful deployments:

**Vercel Deploy Hook Example**:
```bash
# Add to your deployment script
curl -X POST "$VERCEL_URL/api/reindex" \
  -H "Authorization: Bearer $REINDEX_TOKEN"
```

## Content Validation Rules

The system validates content before synchronization:

### Required Fields
- `question`: Must be 10-200 characters
- `shortAnswer`: Must be 20-155 characters (SEO optimized)
- `pubDate`: Required publication date
- `tags`: At least one tag required
- `content`: Cannot be empty

### Slug Requirements
- Must contain only lowercase letters, numbers, and hyphens
- Must be unique across all questions

### Optional Fields
- `updatedDate`: Last modification date
- `heroImage`: Hero image path
- `difficulty`: Defaults to 'easy' if not specified

## Database Schema

The system uses the following database tables:

### questions table
```sql
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  short_answer TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) NOT NULL DEFAULT 'easy',
  pub_date DATE NOT NULL,
  updated_date DATE,
  hero_image TEXT,
  rating_sum INT NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) GENERATED ALWAYS AS 
    (CASE WHEN rating_count > 0 THEN ROUND(rating_sum::numeric / rating_count, 2) ELSE 0 END) STORED,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Search Vector Generation
Search vectors are automatically generated from question, short_answer, and content fields using PostgreSQL's `to_tsvector('simple', ...)` function.

## Error Handling

The system provides comprehensive error handling:

### API Errors
- **401 Unauthorized**: Invalid or missing reindex token
- **400 Bad Request**: Content validation failures
- **500 Internal Server Error**: Database connection or processing errors

### Validation Errors
Content validation errors are returned in development mode:
```json
{
  "ok": false,
  "message": "Content validation failed",
  "validationErrors": [
    {
      "slug": "invalid-question",
      "issues": ["Question must be at least 10 characters long", "At least one tag is required"]
    }
  ]
}
```

### Processing Errors
Individual question processing errors are tracked and reported:
```json
{
  "errorDetails": [
    {
      "slug": "problematic-question",
      "error": "duplicate key value violates unique constraint"
    }
  ]
}
```

## Performance Considerations

### Batch Processing
- Default batch size: 10 questions per transaction
- Configurable via `batchSize` option
- Transactions ensure data consistency

### Search Vector Updates
- Automatic search vector generation via database triggers
- GIN indexes for fast full-text search
- Minimal performance impact during sync

### Connection Management
- Connection pooling via Neon serverless
- Automatic retry logic for transient failures
- Proper connection cleanup

## Monitoring and Debugging

### Sync Statistics
Monitor sync performance with returned statistics:
- Total questions processed
- Error count and details
- Database statistics (total questions, ratings)
- Validation issue count

### Development Mode
In development, additional debugging information is provided:
- Detailed error messages
- Validation error details
- Stack traces for debugging

### Production Mode
In production, sensitive information is filtered:
- Generic error messages
- No stack traces
- Limited debugging information

## Best Practices

1. **Always validate content** before synchronization
2. **Use batch processing** for large content collections
3. **Monitor sync results** for errors and validation issues
4. **Set up automated sync** for production deployments
5. **Test sync process** in development before deploying
6. **Keep reindex token secure** and rotate regularly
7. **Monitor database performance** during large syncs
8. **Use transactions** to ensure data consistency