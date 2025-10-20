// Performance optimization utilities

/**
 * Generate responsive image srcset for better performance
 */
export function generateSrcSet(src: string, widths: number[] = [400, 800, 1200]): string {
  if (!src) return '';
  
  return widths
    .map(width => `${src}?w=${width}&q=80 ${width}w`)
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Record<string, string> = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  default: '33vw'
}): string {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries
    .filter(([key]) => key !== 'default')
    .map(([query, size]) => `${query} ${size}`);
  
  const defaultSize = breakpoints.default || '100vw';
  return [...mediaQueries, defaultSize].join(', ');
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string): string {
  const typeAttr = type ? ` type="${type}"` : '';
  return `<link rel="preload" href="${href}" as="${as}"${typeAttr}>`;
}

/**
 * Generate critical CSS for above-the-fold content
 */
export const criticalCSS = `
  /* Critical styles for immediate rendering */
  html { font-family: system-ui, sans-serif; direction: rtl; }
  body { margin: 0; background: #fafafa; color: #18181b; }
  .dark body { background: #09090b; color: #fafafa; }
  
  /* Loading states */
  .loading { opacity: 0; }
  .loaded { opacity: 1; transition: opacity 0.2s; }
`;

/**
 * Optimize font loading with font-display: swap
 */
export const fontOptimization = {
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  preload: [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap'
  ]
};

/**
 * Core Web Vitals optimization helpers
 */
export const webVitals = {
  // Largest Contentful Paint (LCP) optimization
  optimizeLCP: () => ({
    preloadHeroImage: true,
    inlineCriticalCSS: true,
    prioritizeAboveFold: true
  }),
  
  // First Input Delay (FID) optimization  
  optimizeFID: () => ({
    deferNonCriticalJS: true,
    usePassiveListeners: true,
    minimizeMainThreadWork: true
  }),
  
  // Cumulative Layout Shift (CLS) optimization
  optimizeCLS: () => ({
    setImageDimensions: true,
    reserveSpaceForAds: false,
    avoidDynamicContent: true
  })
};