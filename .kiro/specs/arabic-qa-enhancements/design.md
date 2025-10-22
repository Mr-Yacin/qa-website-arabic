# Design Document

## Overview

This design document outlines the technical implementation for resolving critical data model drift issues in the Arabic Q&A website by implementing a unified database-first architecture. The solution addresses competing storage approaches and establishes a scalable foundation using PostgreSQL with Neon as the primary data store.

The design eliminates the current conflict between file-based storage and database approaches, implementing a single source of truth with proper relational structure, full-text search capabilities, and normalized rating system. This foundation will support the existing Astro-based architecture while providing the scalability needed for production use.

## Architecture

### Unified Database-First Architecture

```mermaid
graph TB
    A[User Request] --> B[Astro Router]
    B --> C{Route Type}
    C -->|Static Pages| D[SSG Pages]
    C -->|Dynamic Content| E[Content Collections]
    C -->|API Routes| F[Database API Endpoints]
    C -->|Search| G[PostgreSQL Full-Text Search]
    C -->|Ratings| H[Normalized Ratings API]

    D --> I[HTML Response]
    E --> J[Markdown Processing]
    J --> K[Component Rendering]
    K --> I

    F --> L[JSON Response]
    G --> L
    H --> L

    I --> M[Client Browser]
    L --> M

    M --> N{Hydration Needed?}
    N -->|Yes| O[StarRating Component]
    N -->|Yes| P[Search Component]
    N -->|No| Q[Static Content]

    subgraph "Unified Database Layer (Neon PostgreSQL)"
        R[(questions table)]
        S[(ratings table)]
        T[Search Vectors]
        U[Rating Aggregates]
        
        R --> T
        R --> U
        S --> U
    end

    F --> R
    G --> R
    H --> S
    
    subgraph "Content Sync Pipeline"
        V[Markdown Files] --> W[Reindex API]
        W --> R
        W --> T
    end
```

### Database Schema Design

The unified schema eliminates data model conflicts by implementing:

1. **questions table** - Single source of truth for all question data
2. **ratings table** - Normalized individual ratings with proper foreign keys
3. **Computed aggregates** - Rating statistics stored in questions table
4. **Search vectors** - PostgreSQL tsvector for full-text search

## Components and Interfaces

### Database Schema Interfaces

```sql
-- Primary questions table with search vectors and rating aggregates
CREATE TABLE IF NOT EXISTS questions (
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
  
  -- Rating aggregates (computed from ratings table)
  rating_sum INT NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) GENERATED ALWAYS AS 
    (CASE WHEN rating_count > 0 THEN ROUND(rating_sum::numeric / rating_count, 2) ELSE 0 END) STORED,
  
  -- Full-text search vector
  search_vector TSVECTOR,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized ratings table with foreign key constraint
CREATE TABLE IF NOT EXISTS ratings (
  slug TEXT NOT NULL,
  user_hash TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (slug, user_hash),
  CONSTRAINT fk_ratings_question FOREIGN KEY (slug) REFERENCES questions(slug) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_tsv ON questions USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_questions_slug ON questions(slug);
CREATE INDEX IF NOT EXISTS idx_questions_pub ON questions(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_slug ON ratings(slug);

-- Automatic search vector update trigger
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    coalesce(NEW.question,'') || ' ' ||
    coalesce(NEW.short_answer,'') || ' ' ||
    coalesce(NEW.content,'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_search_vector
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW EXECUTE PROCEDURE update_search_vector();
```

### API Interface Definitions

```typescript
// Database connection interface
interface DatabaseConnection {
  sql: (query: TemplateStringsArray, ...values: any[]) => Promise<any[]>;
}

// Question data interface matching database schema
interface QuestionRecord {
  id: number;
  slug: string;
  question: string;
  short_answer: string;
  content: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  pub_date: Date;
  updated_date?: Date;
  hero_image?: string;
  rating_sum: number;
  rating_count: number;
  rating_avg: number;
  search_vector?: string;
  created_at: Date;
  updated_at: Date;
}

// Rating record interface
interface RatingRecord {
  slug: string;
  user_hash: string;
  rating: number;
  created_at: Date;
}

// Search result interface with ranking
interface SearchResult {
  slug: string;
  question: string;
  short_answer: string;
  tags: string[];
  rank: number; // ts_rank score from PostgreSQL
}
```

### Component Interfaces (Updated for Database Integration)

```typescript
// StarRating component with database backing
interface StarRatingProps {
  slug: string;
  initialAverage?: number;
  initialCount?: number;
  userRating?: number;
}

// Search component with PostgreSQL full-text search
interface SearchProps {
  placeholder?: string;
  maxSuggestions?: number;
}

// API response interfaces
interface RatingResponse {
  ok: boolean;
  average?: number;
  count?: number;
  userRating?: number;
  message?: string;
}

interface SearchResponse {
  suggestions: SearchResult[];
  hasMore: boolean;
}
```

## Data Models

### Database-First Data Architecture

The unified data model eliminates the previous conflict between file-based storage and database approaches by implementing a single source of truth in PostgreSQL.

#### Questions Table Design

```sql
-- Core questions table with all necessary fields
questions (
  id,                    -- Primary key for internal references
  slug,                  -- URL-friendly identifier (unique)
  question,              -- Question title
  short_answer,          -- SEO-optimized short answer (≤155 chars)
  content,               -- Full markdown content
  tags,                  -- Array of tag strings
  difficulty,            -- Enum: easy, medium, hard
  pub_date,              -- Publication date
  updated_date,          -- Last modification date (nullable)
  hero_image,            -- Optional hero image path
  rating_sum,            -- Sum of all ratings (for aggregate calculation)
  rating_count,          -- Total number of ratings
  rating_avg,            -- Computed average (generated column)
  search_vector,         -- PostgreSQL tsvector for full-text search
  created_at,            -- Record creation timestamp
  updated_at             -- Record modification timestamp
)
```

#### Ratings Table Design

```sql
-- Normalized ratings table
ratings (
  slug,                  -- Foreign key to questions.slug
  user_hash,             -- Privacy-friendly user identifier
  rating,                -- Rating value (1-5)
  created_at             -- Rating timestamp
)
-- Primary key: (slug, user_hash) for upsert operations
```

#### Search Vector Generation

```sql
-- Automatic search vector generation
UPDATE questions SET search_vector = to_tsvector('simple', 
  coalesce(question,'') || ' ' || 
  coalesce(short_answer,'') || ' ' || 
  coalesce(content,'')
);
```

### User Identification Strategy

```typescript
// Privacy-friendly user identification
function generateUserHash(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || '';
  
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${process.env.HASH_SALT}`)
    .digest('hex')
    .slice(0, 16);
}
```

### Content Synchronization Model

```typescript
// Markdown to database synchronization
interface ContentSyncOperation {
  operation: 'insert' | 'update' | 'delete';
  slug: string;
  data?: Partial<QuestionRecord>;
  searchVector?: string;
}

// Batch synchronization for performance
interface SyncBatch {
  operations: ContentSyncOperation[];
  timestamp: Date;
  source: 'markdown' | 'api' | 'migration';
}
```

## Error Handling

### Database-First API Implementation

```typescript
// Database-backed Rating API (POST /api/rate)
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

function generateUserHash(request: Request): string {
  const ip = request.headers.get('cf-connecting-ip') || '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || '';
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${process.env.HASH_SALT}`)
    .digest('hex')
    .slice(0, 16);
}

export async function POST({ request, url }) {
  try {
    const slug = url.searchParams.get('slug');
    const { rating } = await request.json();
    const ratingNum = Number(rating);

    // Validation
    if (!slug || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          message: 'معاملات غير صحيحة' // Invalid parameters in Arabic
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userHash = generateUserHash(request);

    // Upsert rating in normalized table
    await sql`
      INSERT INTO ratings (slug, user_hash, rating)
      VALUES (${slug}, ${userHash}, ${ratingNum})
      ON CONFLICT (slug, user_hash) 
      DO UPDATE SET rating = EXCLUDED.rating, created_at = NOW()
    `;

    // Update aggregates in questions table (atomic transaction)
    await sql`
      UPDATE questions q SET
        rating_sum = (SELECT COALESCE(SUM(rating), 0) FROM ratings WHERE slug = ${slug}),
        rating_count = (SELECT COUNT(*) FROM ratings WHERE slug = ${slug}),
        updated_at = NOW()
      WHERE q.slug = ${slug}
    `;

    // Return updated aggregates
    const [result] = await sql`
      SELECT rating_avg::float AS average, rating_count::int AS count 
      FROM questions WHERE slug = ${slug} LIMIT 1
    `;

    return new Response(
      JSON.stringify({ 
        ok: true, 
        average: result?.average || 0,
        count: result?.count || 0,
        userRating: ratingNum
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Rating API error:', error);
    return new Response(
      JSON.stringify({ ok: false, message: 'خطأ في الخادم' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Database-backed Search API with pagination (GET /api/search)
export async function GET({ url }) {
  try {
    const query = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [], hasMore: false, page: 1, total: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    let results;
    let countResult;
    
    if (query.length >= 3) {
      // Use full-text search for longer queries
      results = await sql`
        SELECT slug, question, short_answer, tags,
               ts_rank(search_vector, to_tsquery('simple', ${query + ':*'})) as rank
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
        ORDER BY rank DESC, pub_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM questions 
        WHERE search_vector @@ to_tsquery('simple', ${query + ':*'})
      `;
    } else {
      // Use ILIKE for short queries
      results = await sql`
        SELECT slug, question, short_answer, tags, 0 as rank
        FROM questions 
        WHERE question ILIKE ${`%${query}%`} OR short_answer ILIKE ${`%${query}%`}
        ORDER BY pub_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as total
        FROM questions 
        WHERE question ILIKE ${`%${query}%`} OR short_answer ILIKE ${`%${query}%`}
      `;
    }

    const total = countResult[0]?.total || 0;
    const hasMore = offset + results.length < total;

    const suggestions = results.map(row => ({
      slug: row.slug,
      question: row.question,
      shortAnswer: row.short_answer,
      tags: row.tags,
      rank: row.rank
    }));

    return new Response(
      JSON.stringify({ 
        suggestions, 
        hasMore, 
        page, 
        total: parseInt(total),
        limit 
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        } 
      }
    );
    
  } catch (error) {
    console.error('Search API error:', error);
    return new Response(
      JSON.stringify({ suggestions: [], hasMore: false, page: 1, total: 0 }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Content Reindexing API (POST /api/reindex)
export async function POST({ request }) {
  try {
    // Verify authorization (simple token-based auth)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.REINDEX_TOKEN}`) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all questions from content collections
    const { getCollection } = await import('astro:content');
    const questions = await getCollection('qa');

    let processed = 0;
    let errors = 0;

    for (const question of questions) {
      try {
        // Upsert question into database
        await sql`
          INSERT INTO questions (
            slug, question, short_answer, content, tags, difficulty, 
            pub_date, updated_date, hero_image, search_vector
          ) VALUES (
            ${question.slug},
            ${question.data.question},
            ${question.data.shortAnswer},
            ${question.body},
            ${question.data.tags},
            ${question.data.difficulty || 'easy'},
            ${question.data.pubDate},
            ${question.data.updatedDate || null},
            ${question.data.heroImage || null},
            to_tsvector('simple', ${question.data.question + ' ' + question.data.shortAnswer + ' ' + question.body})
          )
          ON CONFLICT (slug) DO UPDATE SET
            question = EXCLUDED.question,
            short_answer = EXCLUDED.short_answer,
            content = EXCLUDED.content,
            tags = EXCLUDED.tags,
            difficulty = EXCLUDED.difficulty,
            updated_date = EXCLUDED.updated_date,
            hero_image = EXCLUDED.hero_image,
            search_vector = EXCLUDED.search_vector,
            updated_at = NOW()
        `;
        processed++;
      } catch (err) {
        console.error(`Error processing ${question.slug}:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        processed, 
        errors,
        message: `تم فهرسة ${processed} سؤال بنجاح` 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Reindex API error:', error);
    return new Response(
      JSON.stringify({ ok: false, message: 'خطأ في إعادة الفهرسة' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

## Testing Strategy

### Database Schema Testing

- Verify questions table creation with proper constraints and indexes
- Test rating aggregates calculation with generated columns
- Validate search vector generation and GIN index performance
- Test foreign key relationships and data integrity

### API Integration Testing

- Test rating UPSERT operations and aggregate updates
- Verify PostgreSQL full-text search with ts_rank scoring
- Test content reindexing from markdown to database
- Validate error handling for database connection failures

### Performance Testing

- Benchmark search query performance with GIN indexes
- Test rating aggregate calculation performance under load
- Verify search vector update performance during content sync
- Test concurrent rating submissions and aggregate consistency

## Performance Optimizations

### Database Performance

- GIN indexes on search_vector for fast full-text search
- Computed rating_avg column eliminates runtime calculations
- Proper indexing on slug, pub_date for common queries
- Connection pooling via Neon for optimal database connections

### Search Performance

- PostgreSQL ts_rank scoring for relevance-based results
- ILIKE fallback for short queries (< 3 characters)
- Search vector caching eliminates repeated text processing
- Limited result sets (5 suggestions) for fast response times

### Rating System Performance

- Atomic transactions for rating updates and aggregate recalculation
- UPSERT operations eliminate race conditions
- Normalized ratings table reduces JSON parsing overhead
- Computed columns provide instant average calculations

## Security Considerations

### Database Security

- Parameterized queries prevent SQL injection
- Environment-based connection strings
- Proper user permissions and connection limits
- Input validation before database operations

### User Privacy

- Hashed user identifiers using IP + User-Agent + salt
- No personally identifiable information stored
- Privacy-friendly rating tracking
- Secure hash generation with crypto module

### API Security

- Token-based authentication for reindex endpoint
- Input validation and sanitization
- Rate limiting considerations for production deployment
- Proper error handling without information disclosure

## Deployment Configuration

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host/db

# Security
HASH_SALT=random-salt-for-user-hashing
REINDEX_TOKEN=secure-token-for-content-sync

# Optional: Rate limiting
RATE_LIMIT_WINDOW=3600
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup Script

```javascript
// scripts/setup-neon-db.mjs
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Create questions table with all necessary fields and indexes
await sql`CREATE TABLE IF NOT EXISTS questions (...)`;
await sql`CREATE TABLE IF NOT EXISTS ratings (...)`;
await sql`CREATE INDEX IF NOT EXISTS idx_questions_tsv ON questions USING GIN (search_vector)`;
// ... additional setup
```

### Content Synchronization Pipeline

1. **Development**: Manual reindex via `/api/reindex` endpoint
2. **Production**: Automated reindex triggered by deployment hooks
3. **Content Updates**: n8n workflow → PR → merge → deploy → reindex
4. **CI/CD Integration**: GitHub Action to sync markdown to database on push to main

### GitHub Action for Automatic Sync

```yaml
# .github/workflows/sync-content.yml
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

This database-first design eliminates data model conflicts and provides a scalable foundation for the Arabic Q&A website while maintaining the existing Astro architecture and performance standards.