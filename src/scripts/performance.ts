// Performance monitoring and optimization

/**
 * Monitor Core Web Vitals
 */
export function initPerformanceMonitoring() {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Monitor Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP for debugging (remove in production)
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if needed
        // analytics.track('lcp', lastEntry.startTime);
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }
  }
}

/**
 * Optimize images with Intersection Observer
 */
export function initImageOptimization() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Load high-quality version when in viewport
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
        }
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before entering viewport
    threshold: 0.1
  });

  // Observe all lazy images
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images (hero images, logos, etc.)
  // Note: favicon.svg is already preloaded in BaseLayout.astro
  const criticalImages: string[] = [];
  
  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

/**
 * Optimize scroll performance
 */
export function initScrollOptimization() {
  if (typeof window === 'undefined') return;

  let ticking = false;

  function updateScrollPosition() {
    // Throttle scroll events for better performance
    if (!ticking) {
      requestAnimationFrame(() => {
        // Add scroll-based optimizations here
        ticking = false;
      });
      ticking = true;
    }
  }

  // Use passive listeners for better performance
  window.addEventListener('scroll', updateScrollPosition, { passive: true });
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceMonitoring();
      initImageOptimization();
      preloadCriticalResources();
      initScrollOptimization();
    });
  } else {
    initPerformanceMonitoring();
    initImageOptimization();
    preloadCriticalResources();
    initScrollOptimization();
  }
}