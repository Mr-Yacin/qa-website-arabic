# Arabic Q&A Website

A production-ready Arabic Questions & Answers website built with Astro and Tailwind CSS. Features top-tier SEO optimization, excellent performance, clean user experience, and full RTL (Right-to-Left) support for Arabic content.

## ✨ Features

- **RTL Language Support**: Optimized for Arabic content with proper text direction and typography
- **Content Management**: Questions stored as Markdown files with structured frontmatter validation
- **Interactive Rating System**: 5-star rating component with localStorage persistence and API integration
- **SEO Optimized**: Structured data, automatic sitemaps, RSS feeds, and optimized meta descriptions
- **Responsive Design**: Mobile-first approach with Tailwind CSS and dark mode support
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support
- **High Performance**: Minimal JavaScript usage with selective hydration (Lighthouse 90+ target)
- **Tag-Based Navigation**: Browse questions by topics with filtering and pagination
- **Related Content**: Automatic related questions based on tag similarity

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.14.1 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control

You can verify your installations:

```bash
node --version  # Should be 18.14.1+
npm --version   # Should be 9.0.0+
git --version   # Any recent version
```

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd arabic-qa-site
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:4321`

## 🧞 Available Commands

All commands are run from the root of the project:

| Command | Action |
|---------|--------|
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on `.js`, `.ts`, `.astro` files |
| `npm run format` | Format code with Prettier |
| `npm run astro add` | Add Astro integrations |
| `npm run astro check` | Run TypeScript type checking |

## 📁 Project Structure

```
/
├── .astro/              # Astro build artifacts and type definitions
├── .kiro/               # Kiro configuration and steering rules
├── public/              # Static assets served directly
│   ├── favicon.svg
│   └── images/          # Hero images for questions
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── BaseLayout.astro    # Root layout with RTL support
│   │   ├── SEO.astro          # SEO meta tags component
│   │   ├── Navbar.astro       # Navigation header
│   │   ├── Footer.astro       # Site footer
│   │   ├── CardQuestion.astro # Question card component
│   │   ├── StarRating.jsx     # Interactive rating (React)
│   │   └── Breadcrumbs.astro  # Navigation breadcrumbs
│   ├── content/         # Content collections
│   │   ├── config.ts    # Content schema definitions
│   │   └── qa/          # Question markdown files
│   ├── layouts/         # Page layout components
│   ├── lib/             # Utility functions
│   │   ├── utils.ts     # Date formatting, related questions
│   │   └── paginate.ts  # Pagination helpers
│   ├── pages/           # File-based routing
│   │   ├── index.astro         # Homepage
│   │   ├── q/[slug].astro      # Question detail pages
│   │   ├── tags/               # Tag navigation
│   │   ├── page/[page].astro   # Paginated listings
│   │   ├── api/                # API endpoints
│   │   ├── robots.txt.ts       # SEO robots file
│   │   └── rss.xml.js          # RSS feed
│   └── styles/          # Global styles
└── dist/                # Production build output
```

## 📝 Content Creation

### Adding New Questions

Questions are stored as Markdown files in `src/content/qa/`. Each file requires specific frontmatter fields:

#### Required Fields

```yaml
---
question: "What is Astro and how does it work?"
shortAnswer: "Astro is a modern static site generator that delivers fast websites with minimal JavaScript by default."
pubDate: 2024-01-15
tags: ["astro", "web-development", "static-sites"]
difficulty: "easy"
---
```

#### Optional Fields

```yaml
---
# ... required fields above ...
updatedDate: 2024-01-20
heroImage: "/images/astro-hero.jpg"
---
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ | Question title (10-200 characters) |
| `shortAnswer` | string | ✅ | Brief answer for SEO (20-155 characters) |
| `pubDate` | date | ✅ | Publication date (YYYY-MM-DD format) |
| `tags` | array | ✅ | Topic tags for categorization |
| `difficulty` | enum | ✅ | One of: "easy", "medium", "hard" |
| `updatedDate` | date | ❌ | Last update date |
| `heroImage` | string | ❌ | Path to hero image in `/public/images/` |

### Content Guidelines

1. **Question Titles**: Should be clear, specific, and in Arabic
2. **Short Answers**: Must be ≤155 characters for optimal SEO meta descriptions
3. **Tags**: Use lowercase, hyphenated format (e.g., "web-development", "astro")
4. **Difficulty Levels**:
   - `easy`: Basic concepts, beginner-friendly
   - `medium`: Intermediate topics requiring some background
   - `hard`: Advanced topics, complex implementations
5. **Hero Images**: Optional, store in `public/images/`, use descriptive filenames

### Example Question File

Create `src/content/qa/example-question.md`:

```markdown
---
question: "كيف يمكنني إنشاء موقع ويب سريع باستخدام Astro؟"
shortAnswer: "Astro يسمح ببناء مواقع سريعة من خلال توليد HTML ثابت مع الحد الأدنى من JavaScript."
pubDate: 2024-01-15
tags: ["astro", "performance", "static-sites"]
difficulty: "easy"
heroImage: "/images/astro-performance.jpg"
---

# إنشاء موقع ويب سريع باستخدام Astro

Astro هو مولد مواقع ثابتة حديث يركز على الأداء...

## الميزات الرئيسية

- توليد HTML ثابت
- تحميل JavaScript حسب الحاجة
- دعم متعدد الأطر
- تحسين تلقائي للأداء

## خطوات البدء

1. إنشاء مشروع جديد
2. إضافة المحتوى
3. بناء الموقع
4. النشر
```

## 🎨 Styling and Theming

The site uses Tailwind CSS with custom RTL configuration:

### Dark Mode
- Follows system preference automatically
- Uses `dark:` variants throughout components
- No manual toggle required

### RTL Support
- All components designed for Arabic text flow
- Proper spacing and alignment for RTL layouts
- Icon and layout adjustments included

### Color Scheme
- **Primary**: Indigo (`indigo-600`, `indigo-700`)
- **Neutral**: Zinc (`zinc-50` to `zinc-950`)
- **Accent**: Emerald (`emerald-600`)

## 🔧 Configuration

### Site Configuration

Update `astro.config.mjs` for your domain:

```javascript
export default defineConfig({
  site: 'https://your-domain.com', // Update this
  integrations: [tailwind(), sitemap()],
  trailingSlash: 'never',
  output: 'server',
  adapter: vercel(),
});
```

### Content Schema

Modify `src/content/config.ts` to adjust content validation rules if needed.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Prepare for deployment**:
   ```bash
   npm run build
   ```

2. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new one
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Environment Variables

Set these in your Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `SITE_URL` | `https://your-domain.com` | Your production URL |

### Automatic Deployments

Connect your Git repository to Vercel for automatic deployments:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure build settings:
   - **Framework Preset**: Astro
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy

### Custom Domain

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `site` URL in `astro.config.mjs`

## 🔍 SEO Features

The site includes comprehensive SEO optimization:

- **Structured Data**: FAQPage and BlogPosting schemas
- **Meta Tags**: Optimized titles and descriptions
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Automatic generation via `@astrojs/sitemap`
- **RSS Feed**: Available at `/rss.xml`
- **Robots.txt**: Proper crawler instructions

## ♿ Accessibility

Built with accessibility in mind:

- **Keyboard Navigation**: Full site navigation without mouse
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant contrast ratios
- **RTL Support**: Proper text direction for Arabic content

## 🎯 Performance

Optimized for speed and efficiency:

- **Minimal JavaScript**: Only rating component uses client-side JS
- **Static Generation**: Pre-rendered pages for fast loading
- **Image Optimization**: Proper sizing to prevent layout shift
- **Lazy Loading**: Below-the-fold content loaded on demand
- **Bundle Splitting**: Automatic code splitting by Astro

Target Lighthouse scores: Performance ≥ 90, SEO ≥ 90

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage displays latest 6 questions and popular tags
- [ ] Question detail pages show all required elements
- [ ] Rating component persists to localStorage and calls API
- [ ] Tag pages filter content correctly
- [ ] Pagination works with proper navigation
- [ ] RSS feed generates with correct format
- [ ] Sitemap includes all pages
- [ ] Dark mode follows system preference
- [ ] RTL layout displays correctly
- [ ] Keyboard navigation works throughout
- [ ] Screen reader compatibility

### Performance Testing

Run Lighthouse audit:
```bash
npm run build
npm run preview
# Open Chrome DevTools → Lighthouse → Run audit
```

## 🛠️ Troubleshooting

### Common Issues

**Build Errors**:
- Check content frontmatter validation in `src/content/config.ts`
- Ensure all required fields are present in question files
- Verify image paths exist in `public/images/`

**Development Server Issues**:
- Clear `.astro` directory: `rm -rf .astro`
- Restart development server: `npm run dev`

**Styling Issues**:
- Check Tailwind classes are properly applied
- Verify RTL-specific utilities are used correctly
- Ensure dark mode variants are included

### Getting Help

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run lint`
5. Commit changes: `git commit -m "Add feature"`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

---

Built with ❤️ using [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)