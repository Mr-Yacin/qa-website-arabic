// Defer non-critical CSS loading for better performance
(function() {
  'use strict';
  
  // Load non-critical CSS after page load
  function loadDeferredCSS() {
    const deferredStyles = document.querySelectorAll('link[data-defer]');
    
    deferredStyles.forEach(link => {
      link.rel = 'stylesheet';
      link.removeAttribute('data-defer');
    });
  }
  
  // Load after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDeferredCSS);
  } else {
    loadDeferredCSS();
  }
  
  // Fallback for older browsers
  window.addEventListener('load', loadDeferredCSS);
})();