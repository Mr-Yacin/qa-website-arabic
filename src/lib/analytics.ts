// Analytics utility functions for Google Analytics
// Provides type-safe event tracking for the Arabic Q&A site

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

// Custom event types for the Q&A site
export interface QuestionViewEvent {
  question_id: string;
  question_title: string;
  difficulty: string;
  tags: string[];
}

export interface SearchEvent {
  search_term: string;
  results_count: number;
}

export interface RatingEvent {
  question_id: string;
  rating: number;
  previous_rating?: number;
}

export interface TagClickEvent {
  tag_name: string;
  page_location: string;
}

// Check if Google Analytics is available
export const isAnalyticsAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track question views
export const trackQuestionView = (event: QuestionViewEvent): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', 'view_item', {
    item_id: event.question_id,
    item_name: event.question_title,
    item_category: 'Question',
    custom_parameter_1: event.difficulty,
    custom_parameter_2: event.tags.join(','),
    content_type: 'question',
    language: 'ar'
  });
};

// Track search queries
export const trackSearch = (event: SearchEvent): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', 'search', {
    search_term: event.search_term,
    custom_parameter_1: event.results_count.toString(),
    content_type: 'search',
    language: 'ar'
  });
};

// Track search result clicks
export const trackSearchResultClick = (
  questionId: string,
  questionTitle: string,
  searchTerm: string,
  position: number
): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', 'select_item', {
    item_list_id: 'search_results',
    item_list_name: 'Search Results',
    item_id: questionId,
    item_name: questionTitle,
    index: position,
    search_term: searchTerm,
    content_type: 'search_result_click',
    language: 'ar'
  });
};

// Track question ratings
export const trackRating = (event: RatingEvent): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', 'rate_content', {
    item_id: event.question_id,
    rating: event.rating,
    previous_rating: event.previous_rating,
    content_type: 'question_rating',
    language: 'ar'
  });
};

// Track tag clicks
export const trackTagClick = (event: TagClickEvent): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', 'select_content', {
    content_type: 'tag',
    item_id: event.tag_name,
    custom_parameter_1: event.page_location,
    language: 'ar'
  });
};

// Track page views (for SPA-like navigation)
export const trackPageView = (url: string, title: string): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('config', import.meta.env.PUBLIC_GA_TRACKING_ID, {
    page_path: url,
    page_title: title,
    language: 'ar'
  });
};

// Track custom events
export const trackCustomEvent = (
  eventName: string, 
  parameters: Record<string, any> = {}
): void => {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag!('event', eventName, {
    ...parameters,
    language: 'ar'
  });
};