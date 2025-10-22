// Simple theme configuration
export type ThemeMode = 'light' | 'dark' | 'system';

// Default theme mode
export const DEFAULT_THEME: ThemeMode = 'system';

// Theme storage key
export const THEME_STORAGE_KEY = 'qa-site-theme';

// Get theme from localStorage or return default
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn('Failed to parse stored theme:', error);
  }

  return DEFAULT_THEME;
}

// Store theme in localStorage
export function storeTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to store theme:', error);
  }
}

// Get system theme preference
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme to document
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');

  // Apply theme mode
  const effectiveMode = theme === 'system' ? getSystemTheme() : theme;
  root.classList.add(effectiveMode);

  // Store the theme
  storeTheme(theme);
}

// Initialize theme on page load
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;

  const theme = getStoredTheme();
  applyTheme(theme);

  // Listen for system theme changes when using system mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentTheme = getStoredTheme();
    if (currentTheme === 'system') {
      applyTheme(currentTheme);
    }
  });
}