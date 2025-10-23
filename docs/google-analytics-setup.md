# Google Analytics Setup Guide

This guide explains how to set up and configure Google Analytics 4 (GA4) for your Arabic Q&A website.

## Setup Steps

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Create a new account or use existing one
5. Set up a property for your website
6. Choose "Web" as the platform
7. Enter your website URL: `https://soaale.com`
8. Configure your business information

### 2. Get Your Tracking ID

1. In your GA4 property, go to **Admin** (gear icon)
2. Under **Property**, click **Data Streams**
3. Click on your web stream
4. Copy the **Measurement ID** (format: G-XXXXXXXXXX)

### 3. Configure Environment Variables

Add your Google Analytics tracking ID to your environment variables:

```bash
# In .env.local (for local development)
PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# In production (Vercel)
# Add this as an environment variable in your Vercel dashboard
PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Important**: The variable must start with `PUBLIC_` to be available in the browser.

### 4. Deploy and Verify

1. Deploy your changes to production
2. Visit your website
3. Check Google Analytics Real-time reports to verify tracking is working
4. You should see your visit in the real-time dashboard within a few minutes

## Features Implemented

### Automatic Tracking

- **Page Views**: Automatically tracked on all pages
- **Question Views**: Tracked when users visit individual question pages
- **Rating Events**: Tracked when users rate questions
- **Tag Clicks**: Tracked when users click on tags
- **Search Events**: Tracked when users perform searches
- **Search Result Clicks**: Tracked when users click on search results

### Privacy Features

- **IP Anonymization**: Enabled by default
- **No Ad Personalization**: Disabled for better privacy
- **Development Mode**: Analytics only loads in production

### Custom Events

The following custom events are tracked:

#### Question Views
```javascript
gtag('event', 'view_item', {
  item_id: 'question-slug',
  item_name: 'Question Title',
  item_category: 'Question',
  custom_parameter_1: 'difficulty',
  custom_parameter_2: 'tag1,tag2,tag3',
  content_type: 'question',
  language: 'ar'
});
```

#### Question Ratings
```javascript
gtag('event', 'rate_content', {
  item_id: 'question-slug',
  rating: 5,
  previous_rating: 3, // if updating
  content_type: 'question_rating',
  language: 'ar'
});
```

#### Tag Clicks
```javascript
gtag('event', 'select_content', {
  content_type: 'tag',
  item_id: 'tag-name',
  custom_parameter_1: 'page_location',
  language: 'ar'
});
```

#### Search Events
```javascript
gtag('event', 'search', {
  search_term: 'javascript',
  custom_parameter_1: '5', // results count
  content_type: 'search',
  language: 'ar'
});
```

#### Search Result Clicks
```javascript
gtag('event', 'select_item', {
  item_list_id: 'search_results',
  item_list_name: 'Search Results',
  item_id: 'question-slug',
  item_name: 'Question Title',
  index: 1, // position in results
  search_term: 'javascript',
  content_type: 'search_result_click',
  language: 'ar'
});
```

## Analytics Utility Functions

Use the analytics utility functions in your components:

```typescript
import { trackQuestionView, trackRating, trackTagClick } from '../lib/analytics';

// Track question view
trackQuestionView({
  question_id: 'my-question',
  question_title: 'My Question Title',
  difficulty: 'medium',
  tags: ['javascript', 'react']
});

// Track rating
trackRating({
  question_id: 'my-question',
  rating: 5,
  previous_rating: 3
});

// Track tag click
trackTagClick({
  tag_name: 'javascript',
  page_location: 'question_page'
});

// Track search
trackSearch({
  search_term: 'javascript',
  results_count: 5
});

// Track search result click
trackSearchResultClick(
  'my-question',
  'My Question Title',
  'javascript',
  1 // position in results
);
```

## Useful Reports in Google Analytics

### 1. Content Performance
- **Reports > Engagement > Pages and screens**
- See which questions are most popular
- Track bounce rates and engagement time

### 2. Custom Events
- **Reports > Engagement > Events**
- View question ratings, tag clicks, and other custom events
- Set up conversions for important actions

### 3. Real-time Monitoring
- **Reports > Realtime**
- Monitor live traffic and events
- Verify new features are tracking correctly

### 4. Audience Insights
- **Reports > Demographics**
- Understand your Arabic-speaking audience
- Geographic distribution of users

## Troubleshooting

### Analytics Not Working

1. **Check Environment Variable**
   ```bash
   # Verify the variable is set correctly
   echo $PUBLIC_GA_TRACKING_ID
   ```

2. **Verify in Browser Console**
   ```javascript
   // Check if gtag is loaded
   console.log(typeof window.gtag);
   // Should return 'function'
   ```

3. **Check Network Tab**
   - Open browser dev tools
   - Go to Network tab
   - Look for requests to `googletagmanager.com`

### Common Issues

- **Not loading in development**: This is intentional for privacy
- **Delayed reporting**: GA4 can take 24-48 hours for full data processing
- **Missing events**: Check browser console for JavaScript errors

## GDPR Compliance

For GDPR compliance, consider:

1. **Cookie Consent**: Implement a cookie consent banner
2. **Data Retention**: Configure data retention settings in GA4
3. **User Rights**: Provide options for users to opt-out

## Performance Impact

The Google Analytics implementation is heavily optimized for performance:

- **Async Loading**: Scripts load asynchronously with preconnect hints
- **Production Only**: No tracking in development
- **Minimal Bundle Size**: Only essential tracking code included
- **Forced Reflow Prevention**: Initialization deferred to prevent layout thrashing
- **Debounced Tracking**: Search and interaction events are debounced to prevent spam
- **Idle Callback Usage**: Uses `requestIdleCallback` when available for non-blocking execution
- **DNS Prefetch**: Preconnects to Google Analytics domains for faster loading

### Performance Optimizations Applied

1. **Deferred Initialization**: GA configuration happens after DOM ready
2. **Reduced Data Collection**: Minimized cookie updates and data points
3. **Idle Callback Integration**: Non-critical tracking uses browser idle time
4. **Event Debouncing**: Prevents excessive API calls during rapid interactions
5. **Preconnect Headers**: Establishes early connections to GA servers

## Next Steps

1. Set up **Google Search Console** integration
2. Configure **Custom Dimensions** for better segmentation
3. Set up **Goals and Conversions** for key actions
4. Create **Custom Reports** for Arabic content insights