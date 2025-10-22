// @ts-ignore - Neon types may not be available during build
import { neon } from '@neondatabase/serverless';

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
  difficulty?: string;
  pubDate?: string;
}

export interface SearchIndex {
  questions: SearchQuestion[];
  lastUpdated: Date | null;
}

// Database connection
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// Check if we're in any serverless environment
const isServerless: boolean = typeof process !== 'undefined' && Boolean(
  process.env.VERCEL || 
  process.env.NETLIFY || 
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NODE_ENV === 'production'
);

// In-memory fallback storage for environments without database
let ratingsCache: RatingData = {};
let contactsCache: ContactStorage = { messages: [], lastId: 0 };
let searchIndexCache: SearchIndex = { questions: [], lastUpdated: null };

/**
 * Initialize database tables if they don't exist
 */
async function initializeTables(): Promise<void> {
  if (!sql) return;

  try {
    // Create ratings table
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        question_slug VARCHAR(255) PRIMARY KEY,
        ratings_data JSONB NOT NULL,
        average DECIMAL(3,2) NOT NULL DEFAULT 0,
        count INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create search_index table
    await sql`
      CREATE TABLE IF NOT EXISTS search_index (
        id SERIAL PRIMARY KEY,
        questions_data JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_slug ON ratings(question_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_search_updated ON search_index(last_updated DESC)`;

  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

/**
 * Load data from Neon database or fallback to in-memory cache
 */
async function loadFromStorage<T>(cacheKey: 'ratings' | 'contacts' | 'searchIndex', defaultValue: T): Promise<T> {
  // Try Neon database first if available
  if (sql) {
    try {
      await initializeTables();
      
      switch (cacheKey) {
        case 'ratings': {
          const rows = await sql`SELECT question_slug, ratings_data, average, count, last_updated FROM ratings`;
          const ratingsData: RatingData = {};
          
          for (const row of rows as any[]) {
            ratingsData[row.question_slug] = {
              ratings: row.ratings_data,
              average: parseFloat(row.average),
              count: row.count,
              lastUpdated: new Date(row.last_updated)
            };
          }
          
          return ratingsData as T;
        }
        
        case 'contacts': {
          const rows = await sql`SELECT id, name, email, subject, message, timestamp FROM contacts ORDER BY timestamp DESC`;
          const contacts: ContactStorage = {
            messages: (rows as any[]).map((row: any) => ({
              id: row.id,
              name: row.name,
              email: row.email,
              subject: row.subject,
              message: row.message,
              timestamp: new Date(row.timestamp)
            })),
            lastId: rows.length > 0 ? Math.max(...(rows as any[]).map((r: any) => parseInt(r.id) || 0)) : 0
          };
          
          return contacts as T;
        }
        
        case 'searchIndex': {
          const [row] = await sql`SELECT questions_data, last_updated FROM search_index ORDER BY last_updated DESC LIMIT 1`;
          
          if (row) {
            return {
              questions: row.questions_data,
              lastUpdated: new Date(row.last_updated)
            } as T;
          }
          
          return defaultValue;
        }
      }
    } catch (error) {
      console.warn(`Failed to load from Neon database for ${cacheKey}:`, error);
      // Fall through to in-memory cache
    }
  }

  // Fallback to in-memory cache
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

/**
 * Save data to Neon database or fallback to in-memory cache
 */
async function saveToStorage<T>(cacheKey: 'ratings' | 'contacts' | 'searchIndex', data: T): Promise<void> {
  // Try Neon database first if available
  if (sql) {
    try {
      await initializeTables();
      
      switch (cacheKey) {
        case 'ratings': {
          const ratingsData = data as RatingData;
          
          // Clear existing ratings and insert new ones
          await sql`DELETE FROM ratings`;
          
          for (const [slug, ratingInfo] of Object.entries(ratingsData)) {
            await sql`
              INSERT INTO ratings (question_slug, ratings_data, average, count, last_updated)
              VALUES (${slug}, ${JSON.stringify(ratingInfo.ratings)}, ${ratingInfo.average}, ${ratingInfo.count}, ${ratingInfo.lastUpdated.toISOString()})
              ON CONFLICT (question_slug) 
              DO UPDATE SET 
                ratings_data = EXCLUDED.ratings_data,
                average = EXCLUDED.average,
                count = EXCLUDED.count,
                last_updated = EXCLUDED.last_updated
            `;
          }
          
          console.log('Successfully saved ratings to Neon database');
          return;
        }
        
        case 'searchIndex': {
          const searchIndex = data as SearchIndex;
          
          await sql`
            INSERT INTO search_index (questions_data, last_updated)
            VALUES (${JSON.stringify(searchIndex.questions)}, ${searchIndex.lastUpdated?.toISOString() || new Date().toISOString()})
          `;
          
          // Keep only the latest 5 search index entries
          await sql`
            DELETE FROM search_index 
            WHERE id NOT IN (
              SELECT id FROM search_index 
              ORDER BY last_updated DESC 
              LIMIT 5
            )
          `;
          
          console.log('Successfully saved search index to Neon database');
          return;
        }
      }
    } catch (error) {
      console.warn(`Failed to save to Neon database for ${cacheKey}:`, error);
      // Fall through to in-memory cache
    }
  }

  // Fallback to in-memory cache
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
  
  console.log(`Saved ${cacheKey} to in-memory cache (database fallback)`);
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
  // Try to save directly to Neon database first
  if (sql) {
    try {
      await initializeTables();
      
      await sql`
        INSERT INTO contacts (id, name, email, subject, message, timestamp)
        VALUES (${message.id}, ${message.name}, ${message.email}, ${message.subject}, ${message.message}, ${message.timestamp.toISOString()})
      `;
      
      console.log('Successfully saved contact message to Neon database');
      return;
    } catch (error) {
      console.warn('Failed to save contact message to Neon database:', error);
      // Fall through to legacy method
    }
  }

  // Fallback to loading all contacts and updating
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
  // Test Neon database if available
  if (sql) {
    try {
      await sql`SELECT 1 as test`;
      return true;
    } catch (error) {
      console.warn('Neon database validation failed:', error);
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
  type: 'neon-db' | 'memory' | 'filesystem'; 
  isServerless: boolean; 
  hasDatabase: boolean;
} {
  let type: 'neon-db' | 'memory' | 'filesystem';
  
  if (sql) {
    type = 'neon-db';
  } else if (isServerless) {
    type = 'memory';
  } else {
    type = 'filesystem';
  }

  return {
    type,
    isServerless,
    hasDatabase: Boolean(sql)
  };
}