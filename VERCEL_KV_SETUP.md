# Vercel KV Setup Guide

This application now supports Vercel KV for persistent data storage in production. Here's how to set it up:

## 1. Create a Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "KV" (Key-Value store)
5. Choose a name for your database (e.g., "arabic-qa-ratings")
6. Select your preferred region
7. Click "Create"

## 2. Connect to Your Project

1. In the KV database dashboard, click "Connect Project"
2. Select your Arabic Q&A project
3. Choose the environment (Production, Preview, Development)
4. Click "Connect"

This will automatically add the required environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## 3. Environment Variables

The application will automatically detect and use Vercel KV when these environment variables are present:
- `VERCEL=1` (automatically set by Vercel)
- `KV_REST_API_URL` (your KV database URL)
- `KV_REST_API_TOKEN` (your KV database token)

## 4. Storage Behavior

The application uses a smart storage strategy:

### Production (Vercel with KV)
- ✅ **Primary**: Vercel KV (persistent, fast)
- 🔄 **Fallback**: In-memory cache if KV fails

### Production (Other serverless without KV)
- 🔄 **Primary**: In-memory cache (resets on cold starts)

### Development
- 💾 **Primary**: Local file system (`data/` directory)
- 🔄 **Fallback**: In-memory cache if file system fails

## 5. Benefits of Vercel KV

- ✅ **Free tier available** (25,000 requests/month)
- ✅ **Persistent storage** (data survives deployments)
- ✅ **Fast access** (Redis-based)
- ✅ **Global edge locations**
- ✅ **Automatic scaling**
- ✅ **No cold start penalties**

## 6. Monitoring

You can monitor your KV usage in the Vercel dashboard:
- Request count
- Storage usage
- Response times
- Error rates

## 7. Local Development

For local development, you can optionally set up KV environment variables in `.env.local`:

```bash
# Optional: Use Vercel KV in development
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

If not set, the application will use local file storage in development.

## 8. Data Migration

If you have existing rating data in the `data/` directory, you can migrate it to KV by:
1. Deploying the application with KV configured
2. The first rating submission will initialize the KV store
3. Existing local data will remain in the `data/` directory for backup

## Troubleshooting

### KV Connection Issues
- Check that environment variables are properly set
- Verify KV database is connected to your project
- Check Vercel function logs for error messages

### Storage Fallback
- The application gracefully falls back to in-memory storage if KV fails
- Check console logs for storage method being used
- Use `getStorageInfo()` function to debug storage configuration

## Cost Considerations

Vercel KV free tier includes:
- 25,000 requests per month
- 256 MB storage
- 30 requests per second

For a typical Q&A site, this should be sufficient for moderate traffic.