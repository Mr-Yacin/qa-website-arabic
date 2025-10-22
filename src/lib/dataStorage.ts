import { promises as fs } from 'fs';
import path from 'path';

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

// File paths
const DATA_DIR = 'data';
const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const SEARCH_INDEX_FILE = path.join(DATA_DIR, 'search-index.json');

/**
 * Ensures the data directory exists
 */
async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Generic function to read JSON data from file
 */
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return default value
      return defaultValue;
    }
    console.error(`Error reading file ${filePath}:`, error);
    throw new Error(`Failed to read data from ${filePath}`);
  }
}

/**
 * Generic function to write JSON data to file
 */
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDataDirectory();
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw new Error(`Failed to write data to ${filePath}`);
  }
}

// Rating data functions
export async function loadRatings(): Promise<RatingData> {
  return readJsonFile<RatingData>(RATINGS_FILE, {});
}

export async function saveRatings(ratings: RatingData): Promise<void> {
  return writeJsonFile(RATINGS_FILE, ratings);
}

// Contact data functions
export async function loadContacts(): Promise<ContactStorage> {
  return readJsonFile<ContactStorage>(CONTACTS_FILE, { messages: [], lastId: 0 });
}

export async function saveContacts(contacts: ContactStorage): Promise<void> {
  return writeJsonFile(CONTACTS_FILE, contacts);
}

export async function saveContactMessage(message: ContactFormData): Promise<void> {
  const contacts = await loadContacts();
  contacts.messages.push(message);
  contacts.lastId = Math.max(contacts.lastId, parseInt(message.id) || 0);
  await saveContacts(contacts);
}

// Search index functions
export async function loadSearchIndex(): Promise<SearchIndex> {
  return readJsonFile<SearchIndex>(SEARCH_INDEX_FILE, { questions: [], lastUpdated: null });
}

export async function saveSearchIndex(index: SearchIndex): Promise<void> {
  return writeJsonFile(SEARCH_INDEX_FILE, index);
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
 * Validates that a file exists and is readable
 */
export async function validateDataFile(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the size of a data file in bytes
 */
export async function getDataFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}