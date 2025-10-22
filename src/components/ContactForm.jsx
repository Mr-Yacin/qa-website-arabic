import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'عنوان البريد الإلكتروني غير صحيح';
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'الموضوع مطلوب';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'الموضوع يجب أن يكون على الأقل 3 أحرف';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون على الأقل 10 أحرف';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit status when user modifies form
    if (submitStatus) {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setSubmitStatus('success');
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setErrors({});
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.message || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage('خطأ في الاتصال. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard navigation for submit button
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate role="form" aria-label="نموذج التواصل">
        {/* Name Field */}
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2 transition-colors duration-200"
          >
            الاسم <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg border transition-all duration-200 touch-friendly mobile-optimized
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
              ${errors.name 
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              }
            `}
            placeholder="أدخل اسمك الكامل"
            disabled={isSubmitting}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2 transition-colors duration-200"
          >
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg border transition-all duration-200 touch-friendly mobile-optimized
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
              ${errors.email 
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              }
            `}
            placeholder="example@domain.com"
            disabled={isSubmitting}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label 
            htmlFor="subject" 
            className="block text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2 transition-colors duration-200"
          >
            الموضوع <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`
              w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg border transition-all duration-200 touch-friendly mobile-optimized
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
              ${errors.subject 
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              }
            `}
            placeholder="موضوع رسالتك"
            disabled={isSubmitting}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            aria-invalid={errors.subject ? "true" : "false"}
          />
          {errors.subject && (
            <p id="subject-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label 
            htmlFor="message" 
            className="block text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2 transition-colors duration-200"
          >
            الرسالة <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className={`
              w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg border transition-all duration-200 resize-vertical touch-friendly mobile-optimized sm:min-h-[120px]
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
              ${errors.message 
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400' 
                : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-400'
              }
            `}
            placeholder="اكتب رسالتك هنا..."
            disabled={isSubmitting}
            aria-describedby={errors.message ? "message-error" : undefined}
            aria-invalid={errors.message ? "true" : "false"}
          />
          {errors.message && (
            <p id="message-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 touch-friendly text-base sm:text-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900
              ${isSubmitting
                ? 'bg-zinc-400 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
          </button>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" role="alert">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center space-y-1">
          <p>جميع الحقول المطلوبة مُشار إليها بـ <span className="text-red-500">*</span></p>
          <p className="hidden sm:block">يمكنك استخدام Ctrl+Enter لإرسال النموذج</p>
        </div>
      </form>
    </div>
  );
}