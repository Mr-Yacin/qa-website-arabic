# Contact Form Setup Guide

The contact form is now fully functional with email notifications and proper Vercel deployment support.

## Features

✅ **Contact Form with Validation**: Full Arabic form with client-side and server-side validation  
✅ **Email Notifications**: Automatic email notifications to admins using Resend  
✅ **Vercel KV Storage**: Messages stored in Vercel KV database (with fallback to in-memory)  
✅ **Arabic RTL Support**: Fully localized in Arabic with proper RTL layout  
✅ **Error Handling**: Graceful error handling with Arabic error messages  

## Required Environment Variables

Add these to your Vercel project environment variables:

### Vercel KV Database
```bash
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
```

### Resend Email Service
```bash
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

## Setup Instructions

### 1. Set up Vercel KV Database
1. Go to your Vercel dashboard
2. Navigate to your project → Storage → Create Database
3. Choose "KV" (Key-Value store)
4. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables

### 2. Set up Resend Email Service
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add your domain and verify it (or use their test domain for development)
4. Set the environment variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `ADMIN_EMAIL`: Email address where contact notifications will be sent
   - `FROM_EMAIL`: Email address that will appear as sender (must be from verified domain)

### 3. Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy!

## How It Works

1. **User submits form** → Form validates input client-side
2. **API processes request** → Server validates and stores message in Vercel KV
3. **Email notification sent** → Admin receives formatted email via Resend
4. **Success response** → User sees confirmation message

## Email Template

Admins receive beautifully formatted Arabic emails with:
- Sender details (name, email, timestamp)
- Subject and message content
- Message ID for tracking
- Reply-to functionality (admin can reply directly to sender)

## Fallback Behavior

- **No Resend API key**: Form still works, but no email notifications (logs warning)
- **No Vercel KV**: Falls back to in-memory storage (development only)
- **Email sending fails**: Form submission still succeeds (email failure doesn't break UX)

## Testing

To test the contact form:
1. Visit `/contact` page
2. Fill out the form with valid data
3. Submit and check for success message
4. Admin should receive email notification
5. Check Vercel KV storage for saved message

## Admin Email Example

The admin receives emails like this:

**Subject**: رسالة جديدة: [User's Subject]

**Content**: Formatted HTML email in Arabic with all contact details, styled with RTL support.