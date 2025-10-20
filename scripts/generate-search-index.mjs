#!/usr/bin/env node

/**
 * Generate search index from content collections
 * This is a standalone script that can be run independently
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to extract searchable terms
function extractSearchTerms(text) {
  const cleanText = text
    .replace(/[#*_`\[\]()]/g, ' ') // Remove markdown characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase();
  
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length >= 2)
    .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
  
  return [...new Set(words)];
}

// Parse frontmatter from markdown file
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content: content };
  }
  
  const frontmatterText = match[1];
  const bodyContent = match[2];
  
  // Simple YAML parser for our specific needs
  const frontmatter = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      let value = valueParts.join(':').trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Handle arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/['"]/g, ''))
          .filter(item => item);
      }
      
      // Handle dates
      if (key.trim().includes('Date') || key.trim() === 'pubDate') {
        value = new Date(value).toISOString();
      }
      
      frontmatter[key.trim()] = value;
    }
  }
  
  return { frontmatter, content: bodyContent };
}

async function generateSearchIndex() {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    const qaDir = path.join(projectRoot, 'src', 'content', 'qa');
    const dataDir = path.join(projectRoot, 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Read all markdown files
    const files = await fs.readdir(qaDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== '.gitkeep');
    
    const questions = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(qaDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, content: bodyContent } = parseFrontmatter(content);
      
      if (frontmatter.question && frontmatter.shortAnswer) {
        const slug = path.basename(file, '.md');
        const contentText = bodyContent.substring(0, 200);
        
        // Generate search terms
        const allText = `${frontmatter.question} ${frontmatter.shortAnswer} ${contentText}`;
        const searchTerms = extractSearchTerms(allText);
        
        questions.push({
          slug,
          question: frontmatter.question,
          shortAnswer: frontmatter.shortAnswer,
          content: contentText,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
          searchTerms,
          difficulty: frontmatter.difficulty || 'easy',
          pubDate: frontmatter.pubDate || new Date().toISOString(),
        });
      }
    }
    
    const searchIndex = {
      questions,
      lastUpdated: new Date().toISOString(),
    };
    
    // Save to file
    const indexPath = path.join(dataDir, 'search-index.json');
    await fs.writeFile(indexPath, JSON.stringify(searchIndex, null, 2), 'utf-8');
    
    console.log(`Search index generated with ${questions.length} questions`);
    console.log(`Saved to: ${indexPath}`);
    
  } catch (error) {
    console.error('Error generating search index:', error);
    process.exit(1);
  }
}

generateSearchIndex();