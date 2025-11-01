# Image Fallback System

The Arabic Q&A site now includes a comprehensive image fallback system that handles missing or broken images gracefully.

## Features

### 1. **ImageWithFallback Component**
A reusable Astro component that provides automatic fallback for images.

**Usage:**
```astro
<ImageWithFallback 
  src={heroImage}
  alt="صورة توضيحية للسؤال"
  width={800}
  height={450}
  loading="lazy"
  placeholderType="generated"
  showPlaceholder={true}
/>
```

### 2. **Fallback Types**

#### **Generated Placeholders**
- Creates unique colored gradients based on the alt text
- Displays the first meaningful character (Arabic or English)
- Consistent colors for the same text
- Perfect for questions and dynamic content

#### **Default SVG Placeholders**
- Professional SVG placeholders stored in `/public/images/`
- `placeholder-question.svg` - For Q&A content
- `placeholder-article.svg` - For article content
- Scalable and lightweight

#### **No Placeholder**
- Option to hide images completely if they fail to load
- Useful for optional decorative images

### 3. **Smart Character Detection**
The system intelligently extracts the first meaningful character:
- Prioritizes Arabic characters: `ما هو أسترو؟` → `م`
- Falls back to English: `What is Astro?` → `W`
- Default question mark: `123 test` → `؟`

### 4. **Consistent Color Generation**
- Uses a hash function to generate consistent colors based on text
- Same text always gets the same color combination
- 8 beautiful gradient combinations available

### 5. **Question Text Display**
- Shows the actual question text inside placeholders
- Responsive font sizing based on text length
- Smart text truncation with word boundaries
- Beautiful design with backdrop blur effects
- Question mark icon for visual context

### 6. **Performance Optimized**
- Lazy loading by default
- Smooth opacity transitions
- Minimal JavaScript for error handling
- No layout shift when images fail

## Implementation Details

### **Component Props**
```typescript
interface Props {
  src?: string;                    // Image source URL
  alt: string;                     // Alt text (required)
  class?: string;                  // Additional CSS classes
  width?: number;                  // Image width (default: 800)
  height?: number;                 // Image height (default: 450)
  loading?: 'lazy' | 'eager';      // Loading strategy
  decoding?: 'async' | 'sync';     // Decoding strategy
  showPlaceholder?: boolean;       // Show fallback (default: true)
  placeholderType?: 'generated' | 'default' | 'none';
  questionText?: string;           // Question text to display in placeholder
  showQuestionText?: boolean;      // Show question text (default: true)
}
```

### **Utility Functions**
Located in `src/lib/imageUtils.ts`:

- `getFirstChar(text)` - Extract meaningful character
- `getPlaceholderColors(text)` - Generate consistent colors
- `generatePlaceholderUrl(options)` - Get placeholder URL
- `isImageAccessible(url)` - Check image accessibility
- `getImageWithFallback(primary, fallback, options)` - Smart fallback logic
- `formatTextForPlaceholder(text, maxLength)` - Format text for display
- `getResponsiveFontSize(textLength)` - Get appropriate font size
- `hasArabicText(text)` - Check for Arabic characters

## Usage Examples

### **Question Detail Page**
```astro
<!-- Hero image with question text in placeholder -->
<ImageWithFallback 
  src={heroImage}
  alt={`صورة توضيحية للسؤال: ${question}`}
  questionText={question}
  placeholderType="generated"
  showQuestionText={true}
/>
```

### **Article Cards**
```astro
<!-- Article thumbnail with default placeholder -->
<ImageWithFallback 
  src={article.thumbnail}
  alt={article.title}
  width={400}
  height={225}
  placeholderType="default"
/>
```

### **Optional Images**
```astro
<!-- Hide if image fails -->
<ImageWithFallback 
  src={optionalImage}
  alt="Optional decoration"
  showPlaceholder={false}
/>
```

## Browser Support

- **Modern browsers**: Full support with smooth transitions
- **Older browsers**: Graceful degradation with basic fallbacks
- **No JavaScript**: Static placeholders still work

## Accessibility

- Proper alt text for all images and placeholders
- Screen reader friendly
- High contrast placeholders
- Semantic HTML structure

## Performance Impact

- **Bundle size**: ~2KB additional (utilities + component)
- **Runtime**: Minimal JavaScript for error handling
- **Loading**: Lazy loading by default
- **Caching**: SVG placeholders cached by browser

## Future Enhancements

- Dynamic placeholder generation service
- More placeholder themes
- Image optimization integration
- Progressive loading with blur-up effect