# Implementation Plan

- [x] 1. Initialize project structure and configuration
  - Create new Astro project with TypeScript enabled
  - Install and configure Tailwind CSS integration
  - Install and configure sitemap integration and Vercel adapter
  - Set up ESLint and Prettier with default configurations
  - Configure package.json scripts for dev, build, preview, lint, and format
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Configure Astro and Tailwind settings
  - Configure astro.config.mjs with site URL, integrations, and server output
  - Set up Tailwind config with dark mode, color scheme, and RTL support
  - Create global CSS file with Tailwind imports and base typography styles
  - _Requirements: 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 3. Set up content collections and schema
  - Create src/content/config.ts with qa collection schema using Zod validation
  - Define content collection schema with question, shortAnswer (155 chars), dates, tags, difficulty, and heroImage fields
  - Create content directory structure in src/content/qa/
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 4. Create seed content and assets
  - Write 3 example Markdown files: what-is-astro.md, when-to-use-astro.md, seo-for-qa-sites.md
  - Add valid frontmatter with varied tags and at least one heroImage
  - Ensure shortAnswer fields are ≤ 155 characters for SEO
  - Create sample hero images in public/images/ directory
  - _Requirements: 3.5, 15.1, 15.2, 15.3_

- [x] 5. Implement utility functions
  - Create src/lib/paginate.ts with paginate function returning PaginationResult with page, pages, total, items, hasNext, hasPrev
  - Create src/lib/utils.ts with formatDate function using Arabic locale (ar-MA)
  - Implement relatedByTags function to find related questions by tag overlap
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Build core layout components
  - Create BaseLayout.astro with HTML lang="ar" dir="rtl" and responsive container
  - Implement SEO.astro component with meta tags, canonical URLs, and Open Graph data
  - Build Navbar.astro with sticky header, site title, and navigation links
  - Create Footer.astro with copyright and essential links
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Create content display components
  - Build CardQuestion.astro component for question listings with hover effects
  - Create Breadcrumbs.astro component with RTL-friendly navigation path
  - Implement question metadata display components for dates, tags, and difficulty
  - _Requirements: 5.3, 5.6, 8.2_

- [x] 8. Implement interactive rating component
  - Create StarRating.jsx React component with 5-star interface
  - Add keyboard accessibility with proper ARIA labels and button elements
  - Implement localStorage persistence with rating:slug key format
  - Add API integration for POST requests to /api/rate endpoint
  - _Requirements: 5.4, 5.7, 12.5, 13.1, 13.2, 13.4_

- [x] 9. Build homepage and content discovery
  - Create src/pages/index.astro with hero section and call-to-action
  - Display latest 6 questions using CardQuestion components
  - Implement popular tags section with top 10 tags by usage count
  - Add proper SEO meta tags for homepage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement question detail pages
  - Create src/pages/q/[slug].astro for individual question pages
  - Insert the <Breadcrumbs /> component at the top of the question detail page (/q/[slug]) before the title
  - Display question title, metadata, short answer in highlighted card
  - Integrate StarRating component with client:visible directive
  - Render detailed Markdown content with prose styling
  - Show related questions based on tag similarity
  - Add structured data for FAQPage and BlogPosting schemas
  - Handle 404 cases with redirect to homepage
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [x] 11. Create tag-based navigation system
  - Build src/pages/tags/index.astro with tags listing and introduction
  - Create src/pages/tags/[tag].astro for tag-specific question filtering
  - Display tag counts and implement proper SEO for tag pages
  - Sort questions by publication date in descending order
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 12. Implement pagination system
  - Create src/pages/page/[page].astro for paginated question listings
  - Display 10 questions per page with proper navigation controls
  - Handle redirects for page 1 and invalid page numbers
  - Implement proper SEO titles for paginated pages
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 13. Build RSS feed and SEO infrastructure
  - Create src/pages/rss.xml.js with latest 20 questions using @astrojs/rss
  - Implement src/pages/robots.txt.ts with exact sitemap reference: Sitemap: https://example.com/sitemap-index.xml
  - Ensure sitemap generation includes all pages via @astrojs/sitemap integration
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 14. Implement API endpoints for rating functionality
  - Create src/pages/api/rate.ts POST endpoint with slug validation and rating processing
  - Build src/pages/api/avg.ts GET endpoint for average rating retrieval
  - Add proper error handling and response formatting for both endpoints
  - Include TODO comments for future database integration
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 15. Add accessibility and UX enhancements
  - Implement proper focus rings and hover states for all interactive elements
  - Add "Back to top" floating button with smooth scroll functionality
  - Ensure all images have proper width/height attributes to prevent CLS
  - Verify keyboard navigation works throughout the site
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 14.2, 14.4_

- [x] 16. Optimize performance and finalize styling
  - Configure lazy loading for hero images and below-the-fold content
  - Ensure only StarRating component uses client-side JavaScript
  - Apply consistent dark mode styling across all components
  - Implement proper RTL layout adjustments for all UI elements
  - _Requirements: 2.5, 14.1, 14.2, 14.3, 14.5_

- [x] 17. Create documentation and deployment setup
  - Write comprehensive README.md with prerequisites and setup instructions
  - Document content creation process and frontmatter field explanations
  - Add deployment instructions for Vercel with adapter configuration
  - _Requirements: 15.4, 15.5_

- [x] 18. Manual testing and validation
  - Test homepage displays latest 6 questions and popular tags correctly
  - Verify question detail pages show all required elements and rating works
  - Confirm tag pages filter content correctly and pagination functions properly
  - Test RSS feed generation and sitemap integration
  - Verify dark mode follows the user's system preference (media query), no toggle switch required
  - Check accessibility: keyboard navigation and screen reader support
  - Run Lighthouse audit to achieve Performance ≥ 90 and SEO ≥ 90 scores
  - _Requirements: 14.4, 13.1, 13.2, 13.3, 7.1, 8.1, 9.3, 11.1_

- [x] 19. Implement simple theming system
  - Create simple theme toggle component with light/dark/system preferences
  - Add theme persistence using localStorage with fallback to system preference
  - Add smooth theme transition animations
  - Ensure theme consistency across all components and pages
  - Keep original design as default with simple dark mode support
  - _Requirements: 16.1, 16.2, 16.6, 16.7_
