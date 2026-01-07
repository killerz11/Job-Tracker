// =====================================
// Error Suppressor - Runs FIRST
// Suppresses harmless chrome-extension://invalid errors
// =====================================

(function() {
  'use strict';
  
  // Intercept console.error immediately
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    if (errorString.includes('chrome-extension://invalid')) {
      return; // Suppress
    }
    originalError.apply(console, args);
  };

  // Intercept window.fetch to prevent invalid URLs
  const originalFetch = window.fetch;
  window.fetch = function(url, ...args) {
    if (typeof url === 'string' && url.includes('chrome-extension://invalid')) {
      console.log('[JobTracker] Blocked invalid fetch:', url);
      return Promise.reject(new Error('Blocked invalid chrome-extension URL'));
    }
    return originalFetch.call(this, url, ...args);
  };

  // Suppress error events
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('chrome-extension://invalid')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  // Suppress unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('chrome-extension://invalid')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  console.log('[JobTracker] Error suppressor loaded');
})();
