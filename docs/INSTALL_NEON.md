# Quick Setup Guide: Arabic Q&A Site with Neon Database

## 1. Install Dependencies

```bash
npm install
```

## 2. Setup Neon Database

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Database**: Create a new PostgreSQL database
3. **Get Connection String**: Copy your DATABASE_URL from the Neon dashboard

## 3. Configure Environment Variables

Create a `.env` file:

```bash
# Neon Database
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

## 4. Setup Database Tables

```bash
npm run setup-db
```

## 5. Generate Search Index

```bash
# Search index is now automatically maintained in the database
# No manual search index generation needed
```

## 6. Run Development Server

```bash
npm run dev
```

## 7. Deploy to Vercel

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add your environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy

### Vercel Environment Variables:
- `DATABASE_URL` - Your Neon connection string
- `RESEND_API_KEY` - For contact form emails
- `ADMIN_EMAIL` - Where contact messages are sent
- `FROM_EMAIL` - Sender email for notifications

## Features Included

✅ **Rating System**: Users can rate questions 1-5 stars  
✅ **Contact Form**: Contact messages stored in database with email notifications  
✅ **Search**: Fast search with autocomplete suggestions  
✅ **Arabic RTL**: Fully optimized for Arabic content  
✅ **SEO Optimized**: Structured data, sitemaps, meta tags  
✅ **Responsive**: Mobile-first design with Tailwind CSS  

## Database Storage

All data is stored in your Neon PostgreSQL database:
- **Ratings**: Question ratings with user tracking
- **Contacts**: Contact form submissions  
- **Search Index**: Optimized search data

## Performance Features

- **Edge Functions**: Fast API responses with Vercel Edge
- **Database Indexing**: Optimized queries with PostgreSQL indexes
- **Caching**: 5-minute cache on API responses
- **Graceful Fallbacks**: In-memory cache if database is unavailable

Your Arabic Q&A site is now ready with Neon database! 🚀