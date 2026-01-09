/**
 * Chrome Runtime Messaging Wrapper
 * Provides promise-based interface for chrome.runtime messaging
 */

/**
 * Send message to background script
 * @param {string} type - Message type
 * @param {any} data - Message data
 * @returns {Promise<any>}
 */
export async function sendMessage(type, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type, data },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Register message handler for specific message type
 * @param {string} type - Message type to handle
 * @param {Function} handler - Handler function (async)
 */
export function onMessage(type, handler) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === type) {
      // Handle async handlers
      Promise.resolve(handler(message.data, sender))
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      
      return true; // Keep channel open for async response
    }
  });
}

/**
 * Register multiple message handlers
 * @param {Object} handlers - Object mapping message types to handlers
 */
export function registerHandlers(handlers) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handler = handlers[message.type];
    
    if (handler) {
      Promise.resolve(handler(message.data, sender))
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      
      return true; // Keep channel open for async response
    }
  });
}
