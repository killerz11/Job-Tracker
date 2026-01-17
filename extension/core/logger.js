/**
 * Consistent Logging Utility
 * Provides prefixed logging for JobTracker extension
 */

const PREFIX = '[JobTracker]';

/**
 * Log info message
 * @param {string} message
 * @param {any} data - Optional data to log
 */
export function info(message, data = null) {
  if (data !== null) {
    console.log(`${PREFIX} ${message}`, data);
  } else {
    console.log(`${PREFIX} ${message}`);
  }
}

/**
 * Log error message
 * @param {string} message
 * @param {Error|any} error - Optional error object
 */
export function error(message, error = null) {
  if (error !== null) {
    console.error(`${PREFIX} ${message}`, error);
  } else {
    console.error(`${PREFIX} ${message}`);
  }
}

/**
 * Log debug message (only in development)
 * @param {string} message
 * @param {any} data - Optional data to log
 */
export function debug(message, data = null) {
  // Only log debug in development
  // You can check chrome.runtime.getManifest().version or a flag
  if (data !== null) {
    console.debug(`${PREFIX} [DEBUG] ${message}`, data);
  } else {
    console.debug(`${PREFIX} [DEBUG] ${message}`);
  }
}

/**
 * Log warning message
 * @param {string} message
 * @param {any} data - Optional data to log
 */
export function warn(message, data = null) {
  if (data !== null) {
    console.warn(`${PREFIX} ${message}`, data);
  } else {
    console.warn(`${PREFIX} ${message}`);
  }
}
