(function () {
  'use strict';

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
  function info(message, data = null) {
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
  function error(message, error = null) {
    if (error !== null) {
      console.error(`${PREFIX} ${message}`, error);
    } else {
      console.error(`${PREFIX} ${message}`);
    }
  }

  /**
   * Log warning message
   * @param {string} message
   * @param {any} data - Optional data to log
   */
  function warn(message, data = null) {
    if (data !== null) {
      console.warn(`${PREFIX} ${message}`, data);
    } else {
      console.warn(`${PREFIX} ${message}`);
    }
  }

  /**
   * Page Notifications
   * Shows notifications on the page (not browser notifications)
   */

  /**
   * Show notification on page
   */
  function showPageNotification(message, type) {
    const existing = document.getElementById("jobtracker-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.id = "jobtracker-notification";
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `;
    notification.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Show prominent notification for external apply
   */
  function showExternalApplyNotification(jobData) {
    const existing = document.getElementById("jobtracker-notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.id = "jobtracker-notification";
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 20px;
    background: #2563eb;
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    max-width: 380px;
    animation: slideIn 0.3s ease-out;
  `;
    
    notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="font-size: 24px;">💼</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 8px;">Job Saved!</div>
        <div style="font-size: 13px; opacity: 0.95; margin-bottom: 4px;">
          <strong>${jobData.companyName}</strong>
        </div>
        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 12px;">
          ${jobData.jobTitle}
        </div>
        <div style="background: rgba(255,255,255,0.25); padding: 10px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">📌 Important:</div>
          After you apply on their website, click the JobTracker extension icon to confirm
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 6px 10px; border-radius: 4px; font-size: 11px; text-align: center; opacity: 0.9;">
          A badge will remind you ⓵
        </div>
      </div>
    </div>
  `;

    const style = document.createElement("style");
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideIn 0.3s ease-out reverse";
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Show extension invalid warning banner
   */
  function showExtensionInvalidWarning() {
    const banner = document.createElement("div");
    banner.id = "jobtracker-reload-banner";
    banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fbbf24;
    color: #78350f;
    padding: 12px 20px;
    z-index: 9999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  `;
    banner.innerHTML = `
    <span>⚠️ JobTracker extension was updated</span>
    <button onclick="location.reload()" style="
      background: #78350f;
      color: #fbbf24;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    ">
      Reload Page
    </button>
  `;
    document.body.prepend(banner);
  }

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
  async function sendMessage(type, data = {}) {
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
   * Chrome Storage Wrapper
   * Provides promise-based interface for chrome.storage operations
   */


  /**
   * Get value from chrome.storage.local
   * @param {string|string[]} key
   * @returns {Promise<any>}
   */
  async function getLocal(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key] );
        }
      });
    });
  }

  /**
   * Set value in chrome.storage.local
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async function setLocal(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // ===== Job-specific helpers =====

  /**
   * Get pending jobs from local storage
   * @returns {Promise<Array>}
   */
  async function getPendingJobs() {
    const result = await getLocal('pendingJobs');
    return result || [];
  }

  /**
   * Remove a job from pending jobs
   * @param {string} jobId
   * @returns {Promise<void>}
   */
  async function removePendingJob(jobId) {
    const jobs = await getPendingJobs();
    const updated = jobs.filter(j => j.id !== jobId);
    await setLocal('pendingJobs', updated);
  }

  /**
   * Show final confirmation modal when user returns
   */
  function showConfirmationModal(jobData) {
    // Remove existing modal if any
    const existing = document.getElementById("jobtracker-modal");
    if (existing) existing.remove();

    // Create modal overlay
    const modal = document.createElement("div");
    modal.id = "jobtracker-modal";
    modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

    modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease-out;
    ">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">
          Did you complete your application?
        </h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Confirm to save this to your dashboard
        </p>
      </div>

      <div style="
        background: #f3f4f6;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      ">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">COMPANY</div>
          <div style="font-size: 16px; font-weight: 600; color: #111827;">${jobData.companyName}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">POSITION</div>
          <div style="font-size: 16px; font-weight: 500; color: #111827;">${jobData.jobTitle}</div>
        </div>
        ${jobData.location ? `
        <div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">LOCATION</div>
          <div style="font-size: 14px; color: #111827;">${jobData.location}</div>
        </div>
        ` : ''}
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="jobtracker-confirm-yes" style="
          flex: 1;
          padding: 14px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">
          Yes, I applied
        </button>
        <button id="jobtracker-confirm-no" style="
          flex: 1;
          padding: 14px 24px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">
          No, I didn't
        </button>
      </div>
    </div>
  `;

    // Add animations
    const style = document.createElement("style");
    style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    #jobtracker-confirm-yes:hover {
      background: #1d4ed8 !important;
    }
    #jobtracker-confirm-no:hover {
      background: #e5e7eb !important;
    }
  `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    // Handle Yes button
    document.getElementById("jobtracker-confirm-yes").addEventListener("click", async () => {
      const btn = document.getElementById("jobtracker-confirm-yes");
      btn.textContent = "Saving...";
      btn.disabled = true;
      btn.style.opacity = "0.7";

      try {
        const response = await sendMessage('JOB_APPLICATION', jobData);

        if (response?.success) {
          showPageNotification("✅ Job tracked successfully!", "success");
          await removePendingJob(jobData.id);
          
          // Update badge
          const remaining = await getPendingJobs();
          await sendMessage('UPDATE_BADGE', { count: remaining.length });
        } else {
          showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
        }
        modal.remove();
      } catch (error$1) {
        error("Failed to send message:", error$1);
        showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
        modal.remove();
      }
    });

    // Handle No button
    document.getElementById("jobtracker-confirm-no").addEventListener("click", async () => {
      try {
        await removePendingJob(jobData.id);
        
        // Update badge
        const remaining = await getPendingJobs();
        await sendMessage('UPDATE_BADGE', { count: remaining.length });
        
        showPageNotification("Application not tracked", "error");
        modal.remove();
      } catch (error$1) {
        error("Failed to remove job:", error$1);
        showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
        modal.remove();
      }
    });

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Shared business logic utilities
   * UI functions have been moved to ui/notifications.js and ui/modals.js
   */


  /**
   * Send job application to background
   */
  async function sendJobToBackground(jobData, platform) {
    info(`Sending ${platform} job data to background`, {
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
    });

    try {
      chrome.runtime.sendMessage(
        {
          type: "JOB_APPLICATION",
          data: { ...jobData, platform },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            error("Runtime error:", chrome.runtime.lastError);
            showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
            return;
          }

          info("Background response:", response);
          
          if (response?.success) {
            showPageNotification("✅ Job tracked successfully!", "success");
          } else {
            showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
          }
        }
      );
    } catch (error$1) {
      error("Failed to send message:", error$1);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
    }
  }

  /**
   * Cache external apply job
   */
  function cacheExternalApplyJob(jobData, platform) {
    info(`Caching ${platform} external apply job`, {
      jobTitle: jobData.jobTitle,
      companyName: jobData.companyName,
    });

    try {
      chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
        if (chrome.runtime.lastError) {
          error("Extension context invalidated:", chrome.runtime.lastError);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
          return;
        }

        const jobs = pendingJobs || [];
        
        const newJob = {
          ...jobData,
          id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          platform,
          status: "APPLIED",
          timestamp: Date.now(),
        };
        
        const exists = jobs.some(job => job.jobUrl === newJob.jobUrl);
        if (exists) {
          info("Job already in pending queue");
          showPageNotification("⚠️ Job already saved", "error");
          return;
        }
        
        jobs.push(newJob);
        
        chrome.storage.local.set({ pendingJobs: jobs }, () => {
          if (chrome.runtime.lastError) {
            error("Failed to save:", chrome.runtime.lastError);
            showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
            return;
          }

          info(`External apply job cached successfully. Total pending: ${jobs.length}`);
          
          showExternalApplyNotification(jobData);
          
          try {
            chrome.runtime.sendMessage({ 
              type: "EXTERNAL_APPLY_CACHED",
              count: jobs.length
            });
          } catch (error$1) {
            error("Failed to send message:", error$1);
            showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
          }
        });
      });
    } catch (error$1) {
      error("Extension context error:", error$1);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
    }
  }

  /**
   * Check for pending jobs when page loads
   */
  function checkForPendingJob() {
    chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
      if (pendingJobs && pendingJobs.length > 0) {
        info(`Found pending jobs: ${pendingJobs.length}`);
        // Wait a bit for page to load, then show modal
        setTimeout(() => {
          showConfirmationModal(pendingJobs[0]);
        }, 1000);
      }
    });
  }

  /**
   * Base Platform Class
   * All job platforms (LinkedIn, Naukri, etc.) extend this
   */
  class BasePlatform {
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

  class LinkedInPlatform extends BasePlatform {
    constructor() {
      super('LinkedIn');
    }

    /**
     * Extract job details from LinkedIn page
     */
    extractJobDetails() {
      return this.trySelectors([
        () => this._extractV1(),
        () => this._extractV2(),
        () => this._extractFallback()
      ]);
    }

    /**
     * Detect apply button type on LinkedIn
     */
    detectApplyButton(button) {
      const text = button.innerText?.toLowerCase().trim() || '';
      const aria = button.getAttribute('aria-label')?.toLowerCase() || '';
      const classes = button.className || '';

      // Easy Apply
      if (
        text.includes('easy apply') ||
        aria.includes('easy apply') ||
        (classes.includes('jobs-apply-button') && text === 'easy apply')
      ) {
        return 'EASY_APPLY';
      }

      // Submit button (final step of Easy Apply)
      if (
        text.includes('submit application') ||
        aria.includes('submit application') ||
        text === 'submit' ||
        text === 'submit application'
      ) {
        return 'SUBMIT';
      }

      // External Apply
      if (
        (text === 'apply' ||
          text === 'apply now' ||
          text.startsWith('apply') ||
          aria.includes('apply to') ||
          (classes.includes('jobs-apply-button') && !text.includes('easy'))) &&
        !text.includes('easy apply') &&
        !aria.includes('easy apply') &&
        !text.includes('submit')
      ) {
        return 'EXTERNAL_APPLY';
      }

      return null;
    }

    // Private extraction methods

    /**
     * Primary extraction strategy (current LinkedIn layout)
     */
    _extractV1() {
      const jobTitle = this.querySelector([
        'h1.t-24.t-bold',
        'h1.job-title',
        '.job-details-jobs-unified-top-card__job-title'
      ])?.innerText;

      const company = this.querySelector([
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name'
      ])?.innerText;

      const locationEl = this.querySelector([
        'span[dir="ltr"] span.tvm__text--low-emphasis',
        '.job-details-jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__bullet'
      ]);

      const location = locationEl?.innerText.split('·')[0];

      const description = this.querySelector([
        '.jobs-description-content__text',
        '.jobs-description__content',
        '.jobs-box__html-content'
      ])?.innerText.slice(0, 5000);

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: this.cleanText(location),
        description: this.cleanText(description),
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }

    /**
     * Alternative extraction strategy
     */
    _extractV2() {
      const jobTitle = document.querySelector('h1')?.innerText;
      const company = document.querySelector('[class*="company"]')?.innerText;
      const location = document.querySelector('[class*="location"]')?.innerText;
      const description = document.querySelector('[class*="description"]')?.innerText?.slice(0, 5000);

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: this.cleanText(location),
        description: this.cleanText(description),
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }

    /**
     * Fallback extraction strategy
     */
    _extractFallback() {
      const jobTitle = document.querySelector('h1')?.innerText;
      const company = document.querySelector('a[href*="company"]')?.innerText;

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: '',
        description: '',
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }
  }

  class NaukriPlatform extends BasePlatform {
    constructor() {
      super('Naukri');
    }

    /**
     * Extract job details from Naukri page
     */
    extractJobDetails() {
      return this.trySelectors([
        () => this._extractV1(),
        () => this._extractV2(),
        () => this._extractFallback()
      ]);
    }

    /**
     * Detect apply button type on Naukri
     */
    detectApplyButton(button) {
      const text = button.innerText?.toLowerCase().trim() || '';
      const classes = button.className || '';
      const id = button.id || '';

      // External Apply (company site)
      if (
        text === 'apply on company site' ||
        text.includes('company site') ||
        classes.includes('company-site-button') ||
        id === 'company-site-button'
      ) {
        return 'EXTERNAL_APPLY';
      }

      // Direct Apply (on Naukri)
      if (
        text === 'apply' ||
        text === 'apply now' ||
        (text.includes('apply') && !text.includes('company site')) ||
        classes.includes('apply-button') ||
        id.includes('apply')
      ) {
        return 'DIRECT_APPLY';
      }

      return null;
    }

    // Private extraction methods

    /**
     * Primary extraction strategy (current Naukri layout)
     */
    _extractV1() {
      const jobTitle = this.querySelector([
        'h1',
        '[class*="title"]'
      ])?.innerText;

      // Get company name and remove "X.X Reviews" pattern
      const companyEl = this.querySelector([
        '[class="styles_jd-header-comp-name__MvqAI"]',
        '[class*="comp-name"]',
        '[class*="company"]'
      ]);
      
      let company = companyEl?.innerText;
      if (company) {
        company = company.replace(/\d+\.?\d*\s*Reviews?/gi, '').trim();
      }

      const location = this.querySelector([
        '[class="styles_jhc__location__W_pVs"]',
        '.loc-wrap',
        '.location',
        '[class*="location"]'
      ])?.innerText;

      const description = this.querySelector([
        '[class*="jd-"]',
        '.dang-inner-html',
        '.job-description',
        '[class*="description"]'
      ])?.innerText?.slice(0, 5000);

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: this.cleanText(location),
        description: this.cleanText(description),
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }

    /**
     * Alternative extraction strategy
     */
    _extractV2() {
      const jobTitle = document.querySelector('h1')?.innerText;
      const company = document.querySelector('[class*="company"]')?.innerText;
      const location = document.querySelector('[class*="location"]')?.innerText;
      const description = document.querySelector('[class*="description"]')?.innerText?.slice(0, 5000);

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: this.cleanText(location),
        description: this.cleanText(description),
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }

    /**
     * Fallback extraction strategy
     */
    _extractFallback() {
      const jobTitle = document.querySelector('h1')?.innerText;
      const company = document.querySelector('[class*="comp"]')?.innerText;

      if (!jobTitle || !company) return null;

      return {
        jobTitle: this.cleanText(jobTitle),
        companyName: this.cleanText(company),
        location: '',
        description: '',
        jobUrl: window.location.href,
        appliedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Job Extractor Service
   * Coordinates job extraction across platforms
   * Detects current platform and delegates to appropriate implementation
   */


  /**
   * Get the current platform based on URL
   * @returns {LinkedInPlatform|NaukriPlatform|null}
   */
  function getCurrentPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('linkedin.com')) {
      info('Detected platform: LinkedIn');
      return new LinkedInPlatform();
    }
    
    if (hostname.includes('naukri.com')) {
      info('Detected platform: Naukri');
      return new NaukriPlatform();
    }
    
    error('Unknown platform:', hostname);
    return null;
  }

  /**
   * Extract job details using the detected platform
   * @returns {Object|null} Job data or null if extraction fails
   */
  function extractJob() {
    const platform = getCurrentPlatform();
    
    if (!platform) {
      error('Cannot extract job: platform not supported');
      return null;
    }
    
    try {
      const jobData = platform.extractJobDetails();
      
      if (!jobData) {
        error('Job extraction returned null');
        return null;
      }
      
      info('Job extracted successfully', {
        title: jobData.jobTitle,
        company: jobData.companyName
      });
      
      return jobData;
    } catch (error$1) {
      error('Failed to extract job:', error$1);
      return null;
    }
  }

  /**
   * Detect apply button type using the detected platform
   * @param {HTMLElement} button - The button element that was clicked
   * @returns {string|null} Apply type ('EASY_APPLY', 'EXTERNAL_APPLY', 'DIRECT_APPLY') or null
   */
  function detectApplyType(button) {
    const platform = getCurrentPlatform();
    
    if (!platform) {
      error('Cannot detect apply type: platform not supported');
      return null;
    }
    
    try {
      const applyType = platform.detectApplyButton(button);
      
      if (applyType) {
        info(`Detected apply type: ${applyType}`);
      }
      
      return applyType;
    } catch (error$1) {
      error('Failed to detect apply type:', error$1);
      return null;
    }
  }

  /**
   * Get platform name
   * @returns {string|null} Platform name ('linkedin', 'naukri') or null
   */
  function getPlatformName() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    }
    
    if (hostname.includes('naukri.com')) {
      return 'naukri';
    }
    
    return null;
  }

  info("Content script loaded");

  // Check if extension context is valid on load
  let extensionContextValid = true;
  try {
    chrome.runtime.getManifest();
    info("Extension version:", chrome.runtime.getManifest().version);
    info("Running on:", window.location.href);
  } catch (error$1) {
    extensionContextValid = false;
    error("Extension context invalid on load");
    // Show persistent warning banner
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showExtensionInvalidWarning);
    } else {
      showExtensionInvalidWarning();
    }
  }

  // Global error handler for extension context errors
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Extension context invalidated')) {
      event.preventDefault();
      if (extensionContextValid) {
        extensionContextValid = false;
        showExtensionInvalidWarning();
      }
    }
  });

  // Suppress harmless Chrome extension resource errors in console
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    
    // Ignore chrome-extension://invalid errors (Chrome internal quirk)
    if (errorString.includes('chrome-extension://invalid')) {
      return;
    }
    
    // Show banner for extension context errors but don't spam console
    if (errorString.includes('Extension context invalidated')) {
      if (extensionContextValid) {
        extensionContextValid = false;
        showExtensionInvalidWarning();
      }
      return; // Don't log to console, banner is enough
    }
    
    originalError.apply(console, args);
  };

  let isProcessing = false;
  let cachedJobData = null;
  let lastApplyType = null;
  let processingQueue = [];

  /**
   * Process job queue
   */
  async function processJobQueue() {
    if (isProcessing || processingQueue.length === 0) return;
    
    isProcessing = true;
    const job = processingQueue.shift();
    
    console.log(`[JobTracker] Processing job from queue (${processingQueue.length} remaining):`, job.jobTitle);
    
    try {
      await sendJobToBackground(job.data, job.platform);
    } catch (error$1) {
      error("Failed to process job:", error$1);
    }
    
    isProcessing = false;
    
    // Process next job in queue (reduced delay)
    if (processingQueue.length > 0) {
      setTimeout(processJobQueue, 50); // Reduced from 500ms to 100ms
    }
  }

  /**
   * Extract job details using jobExtractor service
   */
  function extractJobDetails() {
    return extractJob();
  }


  /**
   * Cache job data when Easy Apply starts
   */
  function cacheJobData() {
    const data = extractJobDetails();

    if (data.jobTitle && data.companyName) {
      cachedJobData = data;
      info("Job data cached:", {
        jobTitle: cachedJobData.jobTitle,
        companyName: cachedJobData.companyName,
      });
    } else {
      warn("Could not cache job data - missing title or company");
    }
  }


  async function waitForLinkedInSuccessModal() {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {

        const modal = document.querySelector('[role="dialog"]');

        if (!modal) return;

        const text = (modal.innerText || "").toLowerCase();

        if (
          text.includes("application sent") ||
          text.includes("your application was sent") ||
          text.includes("done")
        ) {
          observer.disconnect();
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Fallback — if nothing changes
      setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, 4000);
    });
  }



  /**
   * FINAL handler – ONLY after submit
   */
  async function handleSubmitApplication() {

    // 1) Ensure this runs only for EASY APPLY submit press
    if (lastApplyType !== "EASY_APPLY") {
      info("Not an Easy Apply flow, skipping");
      return;
    }

    info("Submit clicked - processing application");

    // 2) Wait for LinkedIn internal processing
    await new Promise(r => setTimeout(r, 1000));

    // 3) ---- ABSOLUTE CONFIRMATION LOGIC ----

    const confirmed = await waitForLinkedInSuccessModal();

    if (!confirmed) {
      info("❌ LinkedIn did not show success banner");
      return;
    }

    info("✅ LinkedIn submission confirmed");

    // 4) Get job data only after success
    const jobData = cachedJobData || extractJobDetails();

    // 5) Validate critical fields
    if (!jobData || !jobData.jobTitle || !jobData.companyName) {
      warn("Incomplete job data:", jobData);
      lastApplyType = null;
      return;
    }

    // 6) Add to processing queue
    processingQueue.push({
      data: jobData,
      platform: getPlatformName(),
      jobTitle: jobData.jobTitle
    });

    console.log(
      `[JobTracker] Added to queue (${processingQueue.length} jobs pending)`
    );

    // 7) Reset flow marker
    lastApplyType = null;

    // 8) Start queue processing
    processJobQueue();
  }


  /**
   * Handle external apply button clicks
   */
  function handleExternalApply() {
    info("External apply triggered");
    lastApplyType = "EXTERNAL_APPLY";

    const jobData = extractJobDetails();

    if (!jobData?.jobTitle || !jobData?.companyName) {
      warn("Missing job data for external apply");
      showPageNotification("⚠️ Could not extract job details", "error");
      return;
    }

    cacheExternalApplyJob(jobData, getPlatformName());
  }

  // Check for pending job when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkForPendingJob);
  } else {
    checkForPendingJob();
  }

  /**
   * GLOBAL click listener with comprehensive button detection
   */
  document.addEventListener("click", (e) => {
    // Try to find button element
    let button = e.target;
    
    // Traverse up to find button (max 5 levels)
    for (let i = 0; i < 5 && button && button !== document.body; i++) {
      if (button.tagName === "BUTTON" || button.getAttribute("role") === "button") {
        break;
      }
      button = button.parentElement;
    }

    if (!button || (button.tagName !== "BUTTON" && button.getAttribute("role") !== "button")) {
      return;
    }

    // Use jobExtractor to detect button type
    const applyType = detectApplyType(button);
    
    info("Button clicked, type:", applyType);

    if (applyType === 'EASY_APPLY') {
      info("✅ Easy Apply button detected!");
      lastApplyType = "EASY_APPLY";
      cacheJobData();
      return;
    }

    if (applyType === 'SUBMIT') {
      info("✅ Submit button detected!");
      handleSubmitApplication();
      return;
    }

    if (applyType === 'EXTERNAL_APPLY') {
      info("✅ External Apply button detected!");
      handleExternalApply();
      return;
    }
  }, true);
   // Use capture phase to catch events earlier

  info("Event listeners attached");

})();
