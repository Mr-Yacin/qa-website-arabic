/**
 * Image utility functions for handling fallbacks and placeholders
 */

export interface ImageFallbackOptions {
  width?: number;
  height?: number;
  text?: string;
  type?: 'question' | 'article' | 'general';
}

/**
 * Generate a placeholder image URL based on text and options
 */
export function generatePlaceholderUrl(options: ImageFallbackOptions = {}): string {
  const { width = 800, height = 450, text = 'صورة', type = 'question' } = options;
  
  // For now, return the default SVG placeholder
  // In the future, this could generate dynamic placeholders or use a service
  return '/images/placeholder-question.svg';
}

/**
 * Check if an image URL is valid and accessible
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    // In a real implementation, you might want to do a HEAD request
    // For now, we'll assume the URL is valid if it's properly formatted
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get the appropriate image source with fallback
 */
export function getImageWithFallback(
  primarySrc?: string, 
  fallbackSrc?: string, 
  options: ImageFallbackOptions = {}
): { src: string; isFallback: boolean } {
  if (primarySrc) {
    return { src: primarySrc, isFallback: false };
  }
  
  if (fallbackSrc) {
    return { src: fallbackSrc, isFallback: true };
  }
  
  return { 
    src: generatePlaceholderUrl(options), 
    isFallback: true 
  };
}

/**
 * Generate consistent colors for text-based placeholders
 */
export function getPlaceholderColors(text: string): {
  primary: string;
  secondary: string;
  gradient: string;
} {
  const colorPairs = [
    { primary: '#6366f1', secondary: '#8b5cf6', gradient: 'from-indigo-500 to-purple-500' },
    { primary: '#3b82f6', secondary: '#6366f1', gradient: 'from-blue-500 to-indigo-500' },
    { primary: '#8b5cf6', secondary: '#ec4899', gradient: 'from-purple-500 to-pink-500' },
    { primary: '#10b981', secondary: '#3b82f6', gradient: 'from-emerald-500 to-blue-500' },
    { primary: '#f59e0b', secondary: '#ef4444', gradient: 'from-amber-500 to-red-500' },
    { primary: '#ec4899', secondary: '#ef4444', gradient: 'from-pink-500 to-red-500' },
    { primary: '#14b8a6', secondary: '#06b6d4', gradient: 'from-teal-500 to-cyan-500' },
    { primary: '#f97316', secondary: '#ef4444', gradient: 'from-orange-500 to-red-500' }
  ];
  
  // Simple hash function for consistent color selection
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
  }
  
  const colorIndex = Math.abs(hash) % colorPairs.length;
  return colorPairs[colorIndex];
}

/**
 * Extract the first meaningful character from text (Arabic or English)
 */
export function getFirstChar(text: string): string {
  // Try to find Arabic characters first
  const arabicMatch = text.match(/[\u0600-\u06FF]/);
  if (arabicMatch) return arabicMatch[0];
  
  // Then try English characters
  const englishMatch = text.match(/[A-Za-z]/);
  if (englishMatch) return englishMatch[0].toUpperCase();
  
  // Default to question mark
  return '؟';
}

/**
 * Format text for display in placeholders
 */
export function formatTextForPlaceholder(text: string, maxLength: number = 120): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If we found a space and it's not too far back, use it
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Check if text contains Arabic characters
 */
export function hasArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Get appropriate font size based on text length
 */
export function getResponsiveFontSize(textLength: number): string {
  if (textLength <= 30) return 'text-xl md:text-2xl';
  if (textLength <= 60) return 'text-lg md:text-xl';
  if (textLength <= 90) return 'text-base md:text-lg';
  return 'text-sm md:text-base';
}