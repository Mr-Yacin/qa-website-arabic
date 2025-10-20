import type { CollectionEntry } from 'astro:content';

/**
 * Format a date using Arabic locale (ar-MA)
 */
export function formatDate(date: Date, locale: string = 'ar-MA'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Find related questions by tag overlap, excluding the current question
 */
export function relatedByTags(
  currentQuestion: CollectionEntry<'qa'>,
  allQuestions: CollectionEntry<'qa'>[],
  maxResults: number = 3
): CollectionEntry<'qa'>[] {
  const currentTags = currentQuestion.data.tags;
  
  // Filter out the current question and calculate tag overlap scores
  const questionsWithScores = allQuestions
    .filter(q => q.slug !== currentQuestion.slug)
    .map(question => {
      const commonTags = question.data.tags.filter(tag => 
        currentTags.includes(tag)
      );
      return {
        question,
        score: commonTags.length,
      };
    })
    .filter(item => item.score > 0) // Only include questions with at least one common tag
    .sort((a, b) => {
      // Sort by score (descending), then by publication date (descending)
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return new Date(b.question.data.pubDate).getTime() - new Date(a.question.data.pubDate).getTime();
    });
  
  return questionsWithScores
    .slice(0, maxResults)
    .map(item => item.question);
}