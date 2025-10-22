/**
 * Unified search interface that uses database in production and file-based search in development
 */

import type { Question, SearchOptions, SearchResult } from './database';

// File-based search fallback for development
interface FileSearchIndex {
  questions: Array<{
    slug: string;
    question: string;
    shortAnswer: string;
    content: string;
    tags: string[];
    searchTerms: string[];
    difficulty: string;
    pubDate: string;
  }>;
  lastUpdated: string;
}

async function loadFileSearchIndex(): Promise<FileSearchIndex | null> {
  try {
    // In server-side context, try multiple locations
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Try different locations for the search index
      const possiblePaths = [
        path.join(process.cwd(), 'data', 'search-index.json'),
        path.join(process.cwd(), 'src', 'data', 'search-index.json'),
        path.join(process.cwd(), 'public', 'data', 'search-index.json')
      ];
      
      for (const indexPath of possiblePaths) {
        try {
          const data = await fs.readFile(indexPath, 'utf-8');
          return JSON.parse(data);
        } catch {
          // Try next path
          continue;
        }
      }
      
      // If no file found, return minimal fallback
      console.warn('No search index file found, using empty index');
      return {
        questions: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    // In client-side context, fetch from public directory
    const response = await fetch('/data/search-index.json');
    if (!response.ok) {
      return {
        questions: [],
        lastUpdated: new Date().toISOString()
      };
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to load search index:', error);
    return {
      questions: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

function fileBasedSearch(index: FileSearchIndex, options: SearchOptions): SearchResult {
  const {
    query = '',
    tags = [],
    difficulty,
    limit = 10,
    offset = 0,
    sortBy = 'relevance'
  } = options;

  let results = index.questions;

  // Apply filters
  if (query.trim()) {
    const queryLower = query.toLowerCase();
    results = results.filter(item => {
      return (
        item.question.toLowerCase().includes(queryLower) ||
        item.shortAnswer.toLowerCase().includes(queryLower) ||
        item.content.toLowerCase().includes(queryLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        item.searchTerms.some(term => term.toLowerCase().includes(queryLower))
      );
    });
  }

  if (tags.length > 0) {
    results = results.filter(item => 
      tags.some(tag => item.tags.includes(tag))
    );
  }

  if (difficulty) {
    results = results.filter(item => item.difficulty === difficulty);
  }

  // Sort results
  if (sortBy === 'date') {
    results.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }

  // Apply pagination
  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);

  // Convert to Question format
  const questions: Question[] = paginatedResults.map(item => ({
    id: 0,
    slug: item.slug,
    question: item.question,
    shortAnswer: item.shortAnswer,
    content: item.content,
    tags: item.tags,
    difficulty: item.difficulty as 'easy' | 'medium' | 'hard',
    pubDate: new Date(item.pubDate),
    updatedDate: undefined,
    heroImage: undefined,
    ratingSum: 0,
    ratingCount: 0,
    ratingAvg: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return {
    questions,
    total,
    hasMore: offset + limit < total
  };
}

/**
 * Universal search function that works in both development and production
 */
export async function searchQuestions(options: SearchOptions = {}): Promise<SearchResult> {
  // Try database search first (production)
  if (process.env.DATABASE_URL) {
    try {
      const { searchQuestions: dbSearch } = await import('./database');
      return await dbSearch(options);
    } catch (error) {
      console.warn('Database search failed, falling back to file search:', error);
    }
  }

  // Fallback to file-based search (development)
  const index = await loadFileSearchIndex();
  if (!index) {
    return {
      questions: [],
      total: 0,
      hasMore: false
    };
  }

  return fileBasedSearch(index, options);
}

/**
 * Get question by slug - universal function
 */
export async function getQuestionBySlug(slug: string): Promise<Question | null> {
  // Try database first (production)
  if (process.env.DATABASE_URL) {
    try {
      const { getQuestionBySlug: dbGet } = await import('./database');
      return await dbGet(slug);
    } catch (error) {
      console.warn('Database get failed, falling back to file search:', error);
    }
  }

  // Fallback to file-based search (development)
  const index = await loadFileSearchIndex();
  if (!index) return null;

  const item = index.questions.find(q => q.slug === slug);
  if (!item) return null;

  return {
    id: 0,
    slug: item.slug,
    question: item.question,
    shortAnswer: item.shortAnswer,
    content: item.content,
    tags: item.tags,
    difficulty: item.difficulty as 'easy' | 'medium' | 'hard',
    pubDate: new Date(item.pubDate),
    updatedDate: undefined,
    heroImage: undefined,
    ratingSum: 0,
    ratingCount: 0,
    ratingAvg: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Get popular tags - universal function
 */
export async function getPopularTags(limit: number = 20): Promise<Array<{tag: string, count: number}>> {
  // Try database first (production)
  if (process.env.DATABASE_URL) {
    try {
      const { getPopularTags: dbTags } = await import('./database');
      return await dbTags(limit);
    } catch (error) {
      console.warn('Database tags failed, falling back to file search:', error);
    }
  }

  // Fallback to file-based search (development)
  const index = await loadFileSearchIndex();
  if (!index) return [];

  const tagCounts = new Map<string, number>();
  
  index.questions.forEach(question => {
    question.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}