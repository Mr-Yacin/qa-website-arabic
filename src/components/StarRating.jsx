import { useState, useEffect } from 'react';

export default function StarRating({ slug }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Load saved rating from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRating = localStorage.getItem(`rating:${slug}`);
      if (savedRating) {
        const parsedRating = parseInt(savedRating, 10);
        if (parsedRating >= 1 && parsedRating <= 5) {
          setRating(parsedRating);
          setHasRated(true);
        }
      }
    }
  }, [slug]);

  // Handle rating submission
  const handleRatingSubmit = async (newRating) => {
    if (isSubmitting || hasRated) return;

    setIsSubmitting(true);
    
    try {
      // Save to localStorage immediately for instant feedback
      localStorage.setItem(`rating:${slug}`, newRating.toString());
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

      if (!response.ok) {
        // If API fails, we still keep the localStorage rating
        console.warn('Failed to submit rating to server, but saved locally');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      // Keep the localStorage rating even if API fails
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, starValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRatingSubmit(starValue);
    }
  };

  // Render individual star
  const renderStar = (starValue) => {
    const isFilled = starValue <= (hoveredRating || rating);
    const isDisabled = hasRated || isSubmitting;

    return (
      <button
        key={starValue}
        type="button"
        className={`
          text-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded
          ${isDisabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 transform transition-transform'}
          ${isFilled ? 'text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}
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
    <div className="flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        قيم هذا السؤال
      </h3>
      
      <div 
        className="flex gap-1"
        role="radiogroup"
        aria-label="تقييم السؤال من 1 إلى 5 نجوم"
      >
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>

      {hasRated && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          شكراً لك! تم حفظ تقييمك ({rating} {rating === 1 ? 'نجمة' : 'نجوم'})
        </p>
      )}

      {isSubmitting && (
        <p className="text-sm text-indigo-600 dark:text-indigo-400 text-center">
          جاري الحفظ...
        </p>
      )}

      {!hasRated && !isSubmitting && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center">
          اضغط على النجوم لإعطاء تقييم
        </p>
      )}
    </div>
  );
}