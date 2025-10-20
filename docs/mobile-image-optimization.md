# Mobile Image Optimization

## Overview
The placeholder image system has been optimized for mobile devices to ensure better user experience across all screen sizes.

## Key Improvements

### 1. Responsive Sizing
- **Icon sizes**: Scale from 48px (mobile) to 80px (desktop)
- **Padding**: Adaptive padding from 12px (mobile) to 32px (desktop)
- **Minimum height**: Ensures placeholders are never too small (200px mobile, 300px desktop)

### 2. Responsive Typography
- **Font sizes**: Dynamic scaling based on text length and screen size
- **Text truncation**: Different text lengths for different screen sizes:
  - Mobile: 40 characters max
  - Tablet: 70 characters max  
  - Desktop: 100 characters max

### 3. Layout Optimizations
- **Aspect ratio**: Slightly taller on mobile (16:10) for better text readability
- **Break words**: Prevents text overflow on narrow screens
- **Responsive margins**: Smaller margins on mobile devices

### 4. Performance Enhancements
- **Lazy loading**: Images load only when needed
- **Smooth transitions**: 300ms opacity transitions for better UX
- **Fallback handling**: Graceful degradation when images fail to load

## Implementation Details

### Responsive Text Display
```astro
<!-- Mobile text (shortest) -->
<span class="block sm:hidden">{optimizedText.mobile}</span>
<!-- Tablet text (medium) -->
<span class="hidden sm:block md:hidden">{optimizedText.tablet}</span>
<!-- Desktop text (longest) -->
<span class="hidden md:block">{optimizedText.desktop}</span>
```

### Responsive Sizing Classes
```astro
<!-- Icon sizing -->
class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"

<!-- Padding -->
class="p-3 sm:p-6 md:p-8"

<!-- Font sizes -->
class="text-xs sm:text-sm md:text-base"
```

## Browser Support
- All modern mobile browsers
- iOS Safari 12+
- Chrome Mobile 70+
- Firefox Mobile 68+
- Samsung Internet 10+

## Testing Recommendations
1. Test on actual mobile devices, not just browser dev tools
2. Verify text readability at different screen sizes
3. Check image loading performance on slow connections
4. Ensure touch targets are appropriately sized