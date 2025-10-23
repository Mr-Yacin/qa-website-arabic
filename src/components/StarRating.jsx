import React, { useState, useEffect } from 'react';

// Performance-optimized analytics tracking function
const trackRating = (questionId, rating, previousRating) => {
  if (typeof window !== 'undefined' && window.gtag && window.dataLayer) {
    // Use requestIdleCallback to prevent blocking UI updates
    const trackingFunction = () => {
      window.gtag('event', 'rate_content', {
        item_id: questionId,
        rating: rating,
        previous_rating: previousRating,
        content_type: 'question_rating',
        language: 'ar'
      });
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(trackingFunction, { timeout: 1000 });
    } else {
      setTimeout(trackingFunction, 0);
    }
  }
};

export default function StarRating({ slug, initialData }) {
  const [rating, setRating] = useState(initialData?.userRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(Boolean(initialData?.userRating));
  const [averageRating, setAverageRating] = useState(initialData?.average || null);
  const [voteCount, setVoteCount] = useState(initialData?.count || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load existing rating data from server on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always load from API to ensure we have the most up-to-date user rating
      // This handles cases where server-side user hash generation might be inconsistent
      loadExistingRating();
      
      // Smooth transition from fallback to React component
      const fallback = document.getElementById('rating-fallback');
      const reactContainer = document.getElementById('rating-react');
      
      if (fallback && reactContainer) {
        // Small delay to ensure React component is ready
        setTimeout(() => {
          // Fade out fallback
          fallback.style.opacity = '0';
          
          // After fade out, replace with React component
          setTimeout(() => {
            fallback.style.display = 'none';
            reactContainer.classList.remove('hidden');
            reactContainer.style.opacity = '1';
          }, 300);
        }, 100);
      }
    }
  }, [slug, initialData]);

  // Load existing user rating and average data from server
  const loadExistingRating = async () => {
    try {
      const response = await fetch(`/api/avg?slug=${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        // Handle database-backed API response format
        setAverageRating(data.avg);
        setVoteCount(data.count);
        
        if (data.userRating) {
          setRating(data.userRating);
          setHasRated(true);
        }
        // Database is the single source of truth - no localStorage fallback needed
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
      // No localStorage fallback - database-first approach
    }
  };

  // Handle rating submission or update
  const handleRatingSubmit = async (newRating) => {
    if (isSubmitting) return;

    const wasUpdate = hasRated && rating !== newRating;
    const previousRating = rating;
    const previousHasRated = hasRated;
    
    setIsSubmitting(true);
    setIsUpdating(wasUpdate);
    
    // Optimistic UI update for instant feedback
    setRating(newRating);
    setHasRated(true);
    
    try {
      // Submit to database-backed API
      const response = await fetch(`/api/rate?slug=${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle database-backed API response format
        if (data.ok) {
          setAverageRating(data.average);
          setVoteCount(data.count);
          
          // Track the rating event in Google Analytics
          trackRating(slug, newRating, wasUpdate ? previousRating : undefined);
        } else {
          console.warn('Rating API returned error:', data.message);
          // Revert to previous state
          setRating(previousRating);
          setHasRated(previousHasRated);
        }
      } else {
        // If API fails, revert to previous state
        console.warn('Failed to submit rating to server');
        setRating(previousRating);
        setHasRated(previousHasRated);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Revert to previous state on error
      setRating(previousRating);
      setHasRated(previousHasRated);
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
          text-xl sm:text-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900 rounded will-change-transform touch-friendly p-1 sm:p-2
          ${isDisabled ? 'cursor-default opacity-50' : 'cursor-pointer hover:scale-110 transform active:scale-95'}
          ${isFilled ? 'text-yellow-400 dark:text-yellow-300' : 'text-zinc-300 dark:text-zinc-600'}
          ${hasRated && starValue === rating ? 'drop-shadow-lg ring-2 ring-yellow-400 ring-opacity-50' : ''}
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
    <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200 min-h-[120px] sm:min-h-[140px] w-full max-w-md">
      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 transition-colors duration-200 text-center">
        قيم هذا السؤال
      </h3>
      
      <div 
        className="flex gap-1 justify-center"
        role="radiogroup"
        aria-label="تقييم السؤال من 1 إلى 5 نجوم"
        aria-describedby="rating-instructions"
      >
        {[5, 4, 3, 2, 1].map(renderStar)}
      </div>

      {/* Display average rating and vote count */}
      {averageRating !== null && voteCount > 0 && (
        <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center transition-colors duration-200 px-2">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>متوسط التقييم: {averageRating.toFixed(1)} من 5</span>
            <span className="hidden sm:inline">•</span>
            <span>({voteCount} {voteCount === 1 ? 'تقييم' : 'تقييمات'})</span>
          </div>
        </div>
      )}

      {/* User feedback messages */}
      {hasRated && !isSubmitting && (
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 text-center transition-colors duration-200 px-2">
          {isUpdating ? 
            `تم تحديث تقييمك إلى ${rating} ${rating === 1 ? 'نجمة' : 'نجوم'}` :
            <>
              <span className="block sm:inline">{`تقييمك: ${rating} ${rating === 1 ? 'نجمة' : 'نجوم'}`}</span>
              <span className="block sm:inline sm:before:content-['-'] sm:before:mx-2">يمكنك تغييره بالضغط على نجمة أخرى</span>
            </>
          }
        </p>
      )}

      {isSubmitting && (
        <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 text-center transition-colors duration-200">
          {isUpdating ? 'جاري تحديث التقييم...' : 'جاري الحفظ...'}
        </p>
      )}

      {!hasRated && !isSubmitting && (
        <p id="rating-instructions" className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 text-center transition-colors duration-200 px-2">
          <span className="block sm:inline">اضغط على النجوم لإعطاء تقييم</span>
          <span className="hidden sm:block sm:inline sm:before:content-[','] sm:before:mx-1">أو استخدم مفاتيح الأسهم والمسافة</span>
        </p>
      )}
    </div>
  );
}