import React, { useState, useEffect } from 'react';

export default function StarRating({ slug }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load existing rating data from server on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadExistingRating();
      setIsLoaded(true);
      
      // Hide the static fallback when React component loads
      const fallback = document.querySelector('.rating-fallback');
      if (fallback) {
        fallback.style.display = 'none';
      }
    }
  }, [slug]);

  // Load existing user rating and average data from server
  const loadExistingRating = async () => {
    try {
      const response = await fetch(`/api/avg?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.avg);
        setVoteCount(data.count);
        
        if (data.userRating) {
          setRating(data.userRating);
          setHasRated(true);
          // Also save to localStorage for consistency
          localStorage.setItem(`rating:${slug}`, data.userRating.toString());
        } else {
          // Check localStorage as fallback
          const savedRating = localStorage.getItem(`rating:${slug}`);
          if (savedRating) {
            const parsedRating = parseInt(savedRating, 10);
            if (parsedRating >= 1 && parsedRating <= 5) {
              setRating(parsedRating);
              setHasRated(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
      // Fallback to localStorage
      const savedRating = localStorage.getItem(`rating:${slug}`);
      if (savedRating) {
        const parsedRating = parseInt(savedRating, 10);
        if (parsedRating >= 1 && parsedRating <= 5) {
          setRating(parsedRating);
          setHasRated(true);
        }
      }
    }
  };

  // Handle rating submission or update
  const handleRatingSubmit = async (newRating) => {
    if (isSubmitting) return;

    const wasUpdate = hasRated && rating !== newRating;
    setIsSubmitting(true);
    setIsUpdating(wasUpdate);
    
    try {
      // Save to localStorage immediately for instant feedback
      localStorage.setItem(`rating:${slug}`, newRating.toString());
      const previousRating = rating;
      setRating(newRating);
      setHasRated(true);

      // Submit to API
      const response = await fetch(`/api/rate?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update average rating and vote count from server response
        setAverageRating(data.average);
        setVoteCount(data.count);
      } else {
        // If API fails, revert to previous state
        console.warn('Failed to submit rating to server');
        setRating(previousRating);
        if (!hasRated) {
          setHasRated(false);
          localStorage.removeItem(`rating:${slug}`);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Revert to previous state on error
      const previousRating = rating;
      setRating(previousRating);
      if (!hasRated) {
        setHasRated(false);
        localStorage.removeItem(`rating:${slug}`);
      }
    } finally {
      setIsSubmitting(false);
      setIsUpdating(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, starValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRatingSubmit(starValue);
    }
  };

  // Render individual star with performance optimizations
  const renderStar = (starValue) => {
    const isFilled = starValue <= (hoveredRating || rating);
    const isDisabled = isSubmitting;

    return (
      <button
        key={starValue}
        type="button"
        className={`
          text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900 rounded will-change-transform
          ${isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-110 transform'}
          ${isFilled ? 'text-yellow-400 dark:text-yellow-300' : 'text-zinc-300 dark:text-zinc-600'}
          ${hasRated && starValue === rating ? 'drop-shadow-lg' : ''}
        `}
        onClick={() => !isDisabled && handleRatingSubmit(starValue)}
        onMouseEnter={() => !isDisabled && setHoveredRating(starValue)}
        onMouseLeave={() => !isDisabled && setHoveredRating(0)}
        onKeyDown={(e) => handleKeyDown(e, starValue)}
        disabled={isDisabled}
        aria-label={`قيم بـ ${starValue} ${starValue === 1 ? 'نجمة' : 'نجوم'}`}
        aria-pressed={starValue <= rating}
      >
        ★
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        قيم هذا السؤال
      </h3>
      
      <div 
        className="flex gap-1"
        role="radiogroup"
        aria-label="تقييم السؤال من 1 إلى 5 نجوم"
      >
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>

      {/* Display average rating and vote count */}
      {averageRating !== null && voteCount > 0 && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 text-center transition-colors duration-200">
          <span>متوسط التقييم: {averageRating.toFixed(1)} من 5</span>
          <span className="mx-2">•</span>
          <span>({voteCount} {voteCount === 1 ? 'تقييم' : 'تقييمات'})</span>
        </div>
      )}

      {/* User feedback messages */}
      {hasRated && !isSubmitting && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center transition-colors duration-200">
          {isUpdating ? 
            `تم تحديث تقييمك إلى ${rating} ${rating === 1 ? 'نجمة' : 'نجوم'}` :
            `تقييمك: ${rating} ${rating === 1 ? 'نجمة' : 'نجوم'} - يمكنك تغييره بالضغط على نجمة أخرى`
          }
        </p>
      )}

      {isSubmitting && (
        <p className="text-sm text-indigo-600 dark:text-indigo-400 text-center transition-colors duration-200">
          {isUpdating ? 'جاري تحديث التقييم...' : 'جاري الحفظ...'}
        </p>
      )}

      {!hasRated && !isSubmitting && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center transition-colors duration-200">
          اضغط على النجوم لإعطاء تقييم
        </p>
      )}
    </div>
  );
}