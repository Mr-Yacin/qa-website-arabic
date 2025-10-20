# Project Structure

## Root Directory
```
/
├── .astro/              # Astro build artifacts and type definitions
├── .kiro/               # Kiro configuration and steering rules
├── public/              # Static assets served directly
│   ├── favicon.svg
│   └── images/          # Hero images for questions
├── src/                 # Source code
└── dist/                # Production build output
```

## Source Organization (`src/`)

### Content (`src/content/`)
- **`config.ts`**: Content collection schemas using Zod validation
- **`qa/`**: Question markdown files with frontmatter
  - File naming: kebab-case (e.g., `what-is-astro.md`)
  - Required frontmatter: question, shortAnswer, pubDate, tags, difficulty
  - Optional: updatedDate, heroImage

### Components (`src/components/`)
- **Layout Components**: Navbar, Footer, SEO, Breadcrumbs
- **Content Components**: CardQuestion, QuestionMeta, TagList, DifficultyBadge
- **Interactive**: StarRating.jsx (React component with client-side JS)
- **Utility**: BackToTop, DateDisplay

### Pages (`src/pages/`)
- **`index.astro`**: Homepage with latest questions and popular tags
- **`questions.astro`**: All questions listing
- **`q/[slug].astro`**: Individual question detail pages
- **`tags/`**: Tag navigation (index + [tag] dynamic routes)
- **`page/[page].astro`**: Pagination for question listings
- **`api/`**: API endpoints (rate.ts, avg.ts) for rating functionality
- **SEO Files**: `robots.txt.ts`, `rss.xml.js`

### Layouts (`src/layouts/`)
- **`BaseLayout.astro`**: Core HTML structure with RTL configuration
- **`Layout.astro`**: Page-specific layout wrapper

### Utilities (`src/lib/`)
- **`utils.ts`**: Date formatting, related questions logic
- **`paginate.ts`**: Pagination helper functions

### Styles (`src/styles/`)
- **`global.css`**: Tailwind imports and base typography

## Naming Conventions
- **Files**: kebab-case for all files and directories
- **Components**: PascalCase for Astro/React components
- **Pages**: lowercase with hyphens, follow URL structure
- **Content**: descriptive kebab-case matching question topics

## Architecture Patterns
- **Content-First**: Questions stored as Markdown with type-safe frontmatter
- **Component Composition**: Reusable components for consistent UI
- **File-Based Routing**: Astro's convention for pages and API routes
- **Minimal Client JS**: Only StarRating component uses React hydration
- **RTL-First Design**: All components designed for Arabic content flow