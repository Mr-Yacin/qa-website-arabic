# Technology Stack

## Framework & Build System
- **Astro 5.x**: Static site generator with server-side rendering
- **TypeScript**: Strict configuration extending `astro/tsconfigs/strict`
- **Node.js**: ES modules (`"type": "module"` in package.json)

## Frontend Technologies
- **React 19.x**: For interactive components (minimal usage - only StarRating)
- **Tailwind CSS 3.x**: Utility-first CSS framework with custom RTL configuration
- **@tailwindcss/typography**: For prose content styling

## Deployment & Hosting
- **Vercel Adapter**: Server output mode configured for Vercel deployment
- **Sitemap Generation**: Automatic sitemap creation via @astrojs/sitemap
- **RSS Feed**: Generated at `/rss.xml` with latest 20 questions

## Development Tools
- **ESLint**: TypeScript and Astro linting with @typescript-eslint
- **Prettier**: Code formatting with astro plugin
- **Git**: Version control with standard .gitignore

## Common Commands

### Development
```bash
npm run dev          # Start dev server at localhost:4321
npm run build        # Build for production to ./dist/
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint on .js, .ts, .astro files
npm run format       # Format code with Prettier
```

### Astro CLI
```bash
npm run astro add    # Add integrations
npm run astro check  # Type checking
```

## Configuration Notes
- Server output mode enables API routes and dynamic features
- Tailwind configured for RTL with Arabic font stack
- Dark mode uses system preference (`media` strategy)
- Strict TypeScript configuration for better type safety