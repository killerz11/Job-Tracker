/**
 * Base Platform Class
 * All job platforms (LinkedIn, Naukri, etc.) extend this
 */
export class BasePlatform {
  constructor(name) {
    this.name = name;
  }

  /**
   * Extract job details from page
   * Must be implemented by subclasses
   * @returns {Object} Job data
   */
  extractJobDetails() {
    throw new Error(`${this.name}: extractJobDetails() must be implemented`);
  }

  /**
   * Detect apply button type
   * Must be implemented by subclasses
   * @param {HTMLElement} button
   * @returns {string|null} 'EASY_APPLY', 'EXTERNAL_APPLY', or null
   */
  detectApplyButton(button) {
    throw new Error(`${this.name}: detectApplyButton() must be implemented`);
  }

  /**
   * Try multiple selector strategies
   * @param {Array<Function>} strategies - Array of functions that return data or null
   * @returns {any} First successful result
   */
  trySelectors(strategies) {
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result) return result;
      } catch (error) {
        console.warn(`[${this.name}] Selector strategy failed:`, error);
      }
    }
    return null;
  }

  /**
   * Clean extracted text
   * @param {string} text
   * @returns {string}
   */
  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Query selector with fallback
   * @param {string|string[]} selectors - Single selector or array of selectors
   * @returns {Element|null}
   */
  querySelector(selectors) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorArray) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (error) {
        console.warn(`[${this.name}] Invalid selector: ${selector}`);
      }
    }
    
    return null;
  }
}
