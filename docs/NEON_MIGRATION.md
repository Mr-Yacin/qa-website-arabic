# Migration from Vercel KV to Neon Database

This guide helps you migrate your Arabic Q&A site from Vercel KV to Neon PostgreSQL database.

## Why Migrate to Neon?

- **Better Performance**: PostgreSQL offers superior query performance and indexing
- **Cost Effective**: Neon's serverless PostgreSQL is often more cost-effective than KV
- **Rich Queries**: Support for complex SQL queries, joins, and analytics
- **ACID Compliance**: Full transaction support for data integrity
- **Scalability**: Better handling of large datasets and concurrent users

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Database Created**: Create a new PostgreSQL database in Neon
3. **Connection String**: Get your DATABASE_URL from Neon dashboard

## Migration Steps

### 1. Install Dependencies

```bash
npm install @neondatabase/serverless
npm install --save-dev dotenv
```

### 2. Set Environment Variables

Update your `.env` file:

```bash
# Replace KV credentials with Neon database URL
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require

# Keep existing email configuration
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Setup Database Tables

Run the setup script to create required tables:

```bash
npm run setup-db
```

This creates:
- `ratings` table for question ratings
- `contacts` table for contact form submissions  
- `search_index` table for search functionality
- Appropriate indexes for performance

### 4. Migrate Existing Data (Optional)

If you have existing data in Vercel KV or local files:

```bash
npm run migrate-to-neon
```

This script will:
- Migrate ratings data from KV/filesystem to Neon
- Migrate contact messages to Neon
- Migrate search index to Neon
- Handle conflicts gracefully

### 5. Update Vercel Environment Variables

In your Vercel dashboard:

1. Remove old KV variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

2. Add new Neon variable:
   - `DATABASE_URL` = your Neon connection string

### 6. Deploy and Test

```bash
npm run build
# Deploy to Vercel or your hosting platform
```

## Database Schema

### Ratings Table
```sql
CREATE TABLE ratings (
  question_slug VARCHAR(255) PRIMARY KEY,
  ratings_data JSONB NOT NULL,
  average DECIMAL(3,2) NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Contacts Table
```sql
CREATE TABLE contacts (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Search Index Table
```sql
CREATE TABLE search_index (
  id SERIAL PRIMARY KEY,
  questions_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features After Migration

### Enhanced Performance
- Faster query execution with PostgreSQL indexes
- Better concurrent user handling
- Optimized search with JSONB queries

### New Capabilities
- SQL analytics on ratings and contacts
- Advanced search with full-text search
- Better data relationships and constraints

### Monitoring
- Query performance insights in Neon dashboard
- Connection pooling and optimization
- Automatic backups and point-in-time recovery

## Troubleshooting

### Connection Issues
```bash
# Test your connection
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT 1 as test\`.then(() => console.log('✓ Connected')).catch(console.error);
"
```

### Migration Issues
- Ensure both KV and Neon credentials are available during migration
- Check that your Neon database allows connections from your IP
- Verify the connection string includes `?sslmode=require`

### Performance Optimization
- Monitor query performance in Neon dashboard
- Add indexes for frequently queried columns
- Use connection pooling for high-traffic applications

## Rollback Plan

If you need to rollback:

1. Keep your KV credentials temporarily
2. The old KV-based code is still available in git history
3. You can switch back by reverting the dataStorage.ts changes
4. Export data from Neon if needed for future migrations

## Support

- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Neon Community**: [neon.tech/community](https://neon.tech/community)
- **PostgreSQL Docs**: [postgresql.org/docs](https://postgresql.org/docs)

The migration maintains full backward compatibility - your application will work exactly the same way, just with better performance and capabilities!