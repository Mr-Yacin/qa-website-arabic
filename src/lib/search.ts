import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

export interface SearchIndexItem {
  slug: string;
  question: string;
  shortAnswer: string;
  content: string; // First 200 chars for search
  tags: string[];
  searchTerms: string[]; // Processed search terms
  difficulty: string;
  pubDate: string;
}

export interface SearchIndex {
  questions: SearchIndexItem[];
  lastUpdated: string;
}

/**
 * Extract searchable terms from text content
 */
function extractSearchTerms(text: string): string[] {
  // Remove markdown syntax and normalize text
  const cleanText = text
    .replace(/[#*_`\[\]()]/g, ' ') // Remove markdown characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase();
  
  // Split into words and filter out short words
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length >= 2)
    .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
  
  // Remove duplicates
  return [...new Set(words)];
}

/**
 * Build search index from content collections
 */
export async function buildSearchIndex(): Promise<SearchIndex> {
  try {
    const questions = await getCollection('qa');
    
    const indexItems: SearchIndexItem[] = await Promise.all(
      questions.map(async (question: CollectionEntry<'qa'>) => {
        // Get the rendered content
        const { Content } = await question.render();
        
        // Extract text content (first 200 chars for search)
        const contentText = question.body.substring(0, 200);
        
        // Generate search terms from question, short answer, and content
        const allText = `${question.data.question} ${question.data.shortAnswer} ${contentText}`;
        const searchTerms = extractSearchTerms(allText);
        
        return {
          slug: question.slug,
          question: question.data.question,
          shortAnswer: question.data.shortAnswer,
          content: contentText,
          tags: question.data.tags,
          searchTerms,
          difficulty: question.data.difficulty,
          pubDate: question.data.pubDate.toISOString(),
        };
      })
    );
    
    return {
      questions: indexItems,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error building search index:', error);
    throw error;
  }
}

/**
 * Save search index to file
 */
export async function saveSearchIndex(index: SearchIndex): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    const indexPath = path.join(dataDir, 'search-index.json');
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    
    console.log(`Search index saved with ${index.questions.length} questions`);
  } catch (error) {
    console.error('Error saving search index:', error);
    throw error;
  }
}

/**
 * Load search index from file
 */
export async function loadSearchIndex(): Promise<SearchIndex> {
  try {
    const indexPath = path.join(process.cwd(), 'data', 'search-index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading search index:', error);
    // Return empty index if file doesn't exist
    return {
      questions: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Update search index (rebuild and save)
 */
export async function updateSearchIndex(): Promise<void> {
  try {
    const index = await buildSearchIndex();
    await saveSearchIndex(index);
  } catch (error) {
    console.error('Error updating search index:', error);
    throw error;
  }
}