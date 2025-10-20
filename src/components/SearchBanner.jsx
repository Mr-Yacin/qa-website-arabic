import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function SearchBanner({ 
  placeholder = "ابحث في الأسئلة...", 
  maxSuggestions = 5,
  className = ""
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(data.suggestions?.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
          setError('خطأ في البحث');
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // Navigate to search results page
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          navigateToQuestion(suggestions[selectedIndex].slug);
        } else if (query.trim()) {
          // Navigate to search results page
          window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Navigate to question
  const navigateToQuestion = (slug) => {
    window.location.href = `/q/${slug}`;
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    navigateToQuestion(suggestion.slug);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  // Strip HTML tags for display (from highlighted results)
  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 text-lg bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors duration-200 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400"
          aria-label="البحث في الأسئلة"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
          {isLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            <ul ref={dropdownRef} role="listbox" className="py-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.slug}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-zinc-100 dark:border-zinc-700 last:border-b-0 ${
                    index === selectedIndex
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex flex-col gap-1">
                    {/* Question Title */}
                    <div 
                      className="font-medium text-sm leading-tight"
                      dangerouslySetInnerHTML={{ __html: suggestion.question }}
                    />
                    
                    {/* Short Answer */}
                    <div 
                      className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: suggestion.shortAnswer }}
                    />
                    
                    {/* Tags */}
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {suggestion.tags.length > 3 && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-500">
                            +{suggestion.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="p-4 text-zinc-500 dark:text-zinc-400 text-center">
              <div className="mb-2">لا توجد نتائج لـ "{query}"</div>
              <button
                onClick={() => window.location.href = `/search?q=${encodeURIComponent(query.trim())}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
              >
                البحث في جميع الأسئلة
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}