// Type definitions for data structures
export interface RatingData {
  [questionSlug: string]: {
    ratings: { [userId: string]: number };
    average: number;
    count: number;
    lastUpdated: Date;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  id: string;
}

export interface ContactStorage {
  messages: ContactFormData[];
  lastId: number;
}

export interface SearchQuestion {
  slug: string;
  question: string;
  shortAnswer: string;
  content: string;
  tags: string[];
  searchTerms: string[];
}

export interface SearchIndex {
  questions: SearchQuestion[];
  lastUpdated: Date | null;
}

// Check if we're in a Vercel environment with KV available
const isVercel: boolean = typeof process !== 'undefined' && Boolean(process.env.VERCEL);
const hasKvCredentials: boolean = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Check if we're in any serverless environment
const isServerless: boolean = typeof process !== 'undefined' && Boolean(
  process.env.VERCEL || 
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NODE_ENV === 'production'
);

// In-memory fallback storage for environments without KV
let ratingsCache: RatingData = {};
let contactsCache: ContactStorage = { messages: [], lastId: 0 };
let searchIndexCache: SearchIndex = { questions: [], lastUpdated: null };

/**
 * Load data from Vercel KV, file system (development), or in-memory cache (fallback)
 */
async function loadFromStorage<T>(cacheKey: 'ratings' | 'contacts' | 'searchIndex', defaultValue: T): Promise<T> {
  // Try Vercel KV first if available
  if (isVercel && hasKvCredentials) {
    try {
      const { kv } = await import('@vercel/kv');
      const data = await kv.get<T>(cacheKey);
      if (data !== null) {
        return data;
      }
    } catch (error) {
      console.warn(`Failed to load from Vercel KV for ${cacheKey}:`, error);
      // Fall through to other storage methods
    }
  }

  // In serverless environment without KV, use in-memory cache
  if (isServerless) {
    switch (cacheKey) {
      case 'ratings':
        return ratingsCache as T;
      case 'contacts':
        return contactsCache as T;
      case 'searchIndex':
        return searchIndexCache as T;
      default:
        return defaultValue;
    }
  }

  // In development, try to load from file system
  try {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const DATA_DIR = 'data';
    const fileName = `${cacheKey}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or can't be read, return default
    return defaultValue;
  }
}

/**
 * Save data to Vercel KV, file system (development), or in-memory cache (fallback)
 */
async function saveToStorage<T>(cacheKey: 'ratings' | 'contacts' | 'searchIndex', data: T): Promise<void> {
  // Try Vercel KV first if available
  if (isVercel && hasKvCredentials) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(cacheKey, data);
      console.log(`Successfully saved ${cacheKey} to Vercel KV`);
      return;
    } catch (error) {
      console.warn(`Failed to save to Vercel KV for ${cacheKey}:`, error);
      // Fall through to other storage methods
    }
  }

  // In serverless environment without KV, update in-memory cache
  if (isServerless) {
    switch (cacheKey) {
      case 'ratings':
        ratingsCache = data as RatingData;
        break;
      case 'contacts':
        contactsCache = data as ContactStorage;
        break;
      case 'searchIndex':
        searchIndexCache = data as SearchIndex;
        break;
    }
    console.log(`Saved ${cacheKey} to in-memory cache (serverless fallback)`);
    return;
  }

  // In development, save to file system
  try {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const DATA_DIR = 'data';
    const fileName = `${cacheKey}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    
    // Ensure directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`Saved ${cacheKey} to file system`);
  } catch (error) {
    console.error(`Error saving data for ${cacheKey}:`, error);
    // In case of file system error, still update cache
    switch (cacheKey) {
      case 'ratings':
        ratingsCache = data as RatingData;
        break;
      case 'contacts':
        contactsCache = data as ContactStorage;
        break;
      case 'searchIndex':
        searchIndexCache = data as SearchIndex;
        break;
    }
  }
}

// Rating data functions
export async function loadRatings(): Promise<RatingData> {
  return loadFromStorage('ratings', {});
}

export async function saveRatings(ratings: RatingData): Promise<void> {
  return saveToStorage('ratings', ratings);
}

// Contact data functions
export async function loadContacts(): Promise<ContactStorage> {
  return loadFromStorage('contacts', { messages: [], lastId: 0 });
}

export async function saveContacts(contacts: ContactStorage): Promise<void> {
  return saveToStorage('contacts', contacts);
}

export async function saveContactMessage(message: ContactFormData): Promise<void> {
  const contacts = await loadContacts();
  contacts.messages.push(message);
  contacts.lastId = Math.max(contacts.lastId, parseInt(message.id) || 0);
  await saveContacts(contacts);
}

// Search index functions
export async function loadSearchIndex(): Promise<SearchIndex> {
  return loadFromStorage('searchIndex', { questions: [], lastUpdated: null });
}

export async function saveSearchIndex(index: SearchIndex): Promise<void> {
  return saveToStorage('searchIndex', index);
}

// Utility functions
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

export function generateUserId(ip: string, userAgent: string): string {
  // Simple hash function for user identification (privacy-friendly)
  const data = ip + userAgent;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validates that data storage is available
 */
export async function validateDataStorage(): Promise<boolean> {
  // Test Vercel KV if available
  if (isVercel && hasKvCredentials) {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set('_test', 'test');
      await kv.del('_test');
      return true;
    } catch (error) {
      console.warn('Vercel KV validation failed:', error);
      // Fall through to other validation methods
    }
  }

  // In serverless, we always have in-memory storage available
  if (isServerless) {
    return true;
  }

  // In development, check if we can write to the data directory
  try {
    const { promises: fs } = await import('fs');
    const DATA_DIR = 'data';
    
    // Try to create the directory if it doesn't exist
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    // Test write access
    const testFile = `${DATA_DIR}/.test`;
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets information about the current storage method
 */
export function getStorageInfo(): { 
  type: 'vercel-kv' | 'memory' | 'filesystem'; 
  isServerless: boolean; 
  hasKv: boolean;
} {
  let type: 'vercel-kv' | 'memory' | 'filesystem';
  
  if (isVercel && hasKvCredentials) {
    type = 'vercel-kv';
  } else if (isServerless) {
    type = 'memory';
  } else {
    type = 'filesystem';
  }

  return {
    type,
    isServerless,
    hasKv: hasKvCredentials
  };
}