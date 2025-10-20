# Simple Theming System

This document describes the simple theming system implemented for the Arabic Q&A site.

## Overview

The theming system provides a simple toggle between three modes:
- **System**: Follows the user's operating system preference
- **Light**: Force light mode
- **Dark**: Force dark mode

## Features

- **Simple Toggle**: Click to cycle through System → Light → Dark → System
- **Persistence**: Theme preference is saved in localStorage
- **Smooth Transitions**: Animated theme switching with 300ms duration
- **No Flash**: Theme is applied before page render to prevent flash of unstyled content
- **Accessibility**: Full keyboard support and proper ARIA labels

## Usage

### Theme Toggle Component

The theme toggle is automatically included in the navigation bar. Users can:
- Click the button to cycle through theme modes
- Use keyboard (Enter or Space) to toggle themes
- See the current theme mode with appropriate icons and labels

### Theme Implementation

The system uses:
- **Tailwind CSS**: Built-in dark mode classes (`dark:`)
- **Class-based Dark Mode**: `dark` class on `<html>` element
- **localStorage**: Stores theme preference as simple string
- **System Detection**: Uses `prefers-color-scheme` media query

### CSS Classes

All components use standard Tailwind dark mode classes:

```css
/* Light mode (default) */
.bg-white

/* Dark mode */
.dark:bg-zinc-900

/* Both modes with transitions */
.bg-white dark:bg-zinc-900 transition-colors duration-300
```

## Technical Details

### Theme Storage

Theme preference is stored in localStorage as a simple string:
- `'system'` - Follow OS preference
- `'light'` - Force light mode  
- `'dark'` - Force dark mode

### Initialization

Theme is applied early in the page load process:

1. **Inline Script**: Runs in `<head>` before page render
2. **Read Preference**: Gets theme from localStorage or defaults to 'system'
3. **Apply Class**: Adds 'light' or 'dark' class to `<html>` element
4. **Prevent Flash**: Ensures theme is applied before content renders

### Theme Detection

For 'system' mode, the theme is determined by:
```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches
```

### Event Handling

The system listens for:
- **User Clicks**: Manual theme toggle
- **System Changes**: OS theme preference changes (when in system mode)
- **Page Navigation**: Re-initializes theme on SPA-like navigation

## Browser Support

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **localStorage**: Required for theme persistence
- **CSS Custom Properties**: Not required (uses standard Tailwind classes)
- **Graceful Degradation**: Falls back to system theme if JS is disabled

## Customization

### Modifying Theme Colors

To change the color scheme, update the Tailwind configuration in `tailwind.config.mjs`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
        500: '#your-color',
        600: '#your-darker-color',
        // ...
      }
    }
  }
}
```

### Adding Custom Components

When creating new components, use Tailwind's dark mode classes:

```astro
<div class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
  <!-- Your content -->
</div>
```

### Theme Toggle Customization

The theme toggle component can be customized by modifying `src/components/SimpleThemeToggle.astro`:
- Change icons
- Modify labels
- Adjust styling
- Add animations

## Performance

The simple theming system is optimized for performance:
- **Minimal JavaScript**: Only essential code for theme switching
- **CSS Transitions**: Hardware-accelerated color transitions
- **No Runtime Calculations**: Uses pre-defined Tailwind classes
- **Early Application**: Prevents layout shifts and flashes

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and role attributes
- **High Contrast**: Works with system high contrast modes
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Focus Indicators**: Clear focus rings on interactive elements