(function () {
  'use strict';

  /**
   * Chrome Runtime Messaging Wrapper
   * Provides promise-based interface for chrome.runtime messaging
   */


  /**
   * Register multiple message handlers
   * @param {Object} handlers - Object mapping message types to handlers
   */
  function registerHandlers(handlers) {
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
   * Chrome Storage Wrapper
   * Provides promise-based interface for chrome.storage operations
   */

  /**
   * Get value from chrome.storage.sync
   * @param {string|string[]} key - Key or array of keys
   * @returns {Promise<any>}
   */
  async function get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(typeof key === 'string' ? result[key] : result);
        }
      });
    });
  }

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
          resolve(typeof key === 'string' ? result[key] : result);
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

  /**
   * JobQueue - Manages job queue with retry logic
   */
  class JobQueue {
    constructor() {
      this.queue = [];
      this.processing = false;
      this.failedJobsKey = 'failedJobs';
    }

    /**
     * Add job to queue
     */
    async add(job) {
      this.queue.push(job);
      info('Job added to queue:', job.jobTitle);
      
      // Start processing if not already processing
      if (!this.processing) {
        await this.process();
      }
    }

    /**
     * Process queue
     */
    async process() {
      if (this.processing || this.queue.length === 0) return;
      
      this.processing = true;
      
      while (this.queue.length > 0) {
        const job = this.queue.shift();
        
        try {
          info(`Processing job: ${job.jobTitle}`);
          await this._sendJob(job);
          info(`✅ Job processed successfully: ${job.jobTitle}`);
        } catch (error$1) {
          error(`Failed to process job: ${job.jobTitle}`, error$1);
          await this._saveFailed(job, error$1.message);
        }
        
        // Small delay between jobs
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      this.processing = false;
    }

    /**
     * Retry failed jobs
     */
    async retryFailed() {
      const failedJobs = await this._loadFailed();
      
      if (failedJobs.length === 0) {
        info('No failed jobs to retry');
        return;
      }
      
      info(`Retrying ${failedJobs.length} failed jobs`);
      
      for (const job of failedJobs) {
        await this.add(job.data);
      }
      
      // Clear failed jobs after adding to queue
      await this._clearFailed();
    }

    /**
     * Get failed jobs count
     */
    async getFailedCount() {
      const failedJobs = await this._loadFailed();
      return failedJobs.length;
    }

    /**
     * Send job (to be implemented by subclass or injected)
     */
    async _sendJob(job) {
      throw new Error('_sendJob must be implemented');
    }

    /**
     * Save failed job to storage
     */
    async _saveFailed(job, errorMessage) {
      const failedJobs = await this._loadFailed();
      
      failedJobs.push({
        data: job,
        error: errorMessage,
        timestamp: Date.now(),
        retryCount: (job.retryCount || 0) + 1
      });
      
      await setLocal(this.failedJobsKey, failedJobs);
      info(`Saved failed job: ${job.jobTitle}`);
    }

    /**
     * Load failed jobs from storage
     */
    async _loadFailed() {
      const failedJobs = await getLocal(this.failedJobsKey);
      return failedJobs || [];
    }

    /**
     * Clear failed jobs
     */
    async _clearFailed() {
      await setLocal(this.failedJobsKey, []);
    }
  }

  const CONFIG = {
    // Default production URLs
    PRODUCTION: {
      BACKEND_URL: "https://humorous-solace-production.up.railway.app",
      DASHBOARD_URL: "https://job-tracker-gules-eta.vercel.app"
    },
    
    // Development URLs (override via chrome.storage)
    DEVELOPMENT: {
      BACKEND_URL: "http://localhost:4000",
      DASHBOARD_URL: "http://localhost:3000"
    }
  };

  /**
   * Get the current backend URL
   * Priority: chrome.storage.sync > production default
   */
  async function getBackendUrl() {
    try {
      const result = await get(['apiUrl', 'devMode']);
      const { apiUrl, devMode } = result;
      
      // If custom URL is set, use it
      if (apiUrl) {
        return apiUrl;
      }
      
      // If dev mode is enabled, use dev URL
      if (devMode) {
        return CONFIG.DEVELOPMENT.BACKEND_URL;
      }
      
      // Default to production
      return CONFIG.PRODUCTION.BACKEND_URL;
    } catch (error) {
      console.error('[JobTracker] Error getting backend URL:', error);
      return CONFIG.PRODUCTION.BACKEND_URL;
    }
  }

  /**
   * ApiClient - Handles all backend API calls
   */
  class ApiClient {
    constructor() {
      this.baseUrl = null;
      this.authToken = null;
    }

    /**
     * Initialize client (load config)
     */
    async init() {
      this.baseUrl = await getBackendUrl();
      this.authToken = await get('authToken');
      info('ApiClient initialized:', this.baseUrl);
    }

    /**
     * Save job to backend
     */
    async saveJob(jobData) {
      if (!this.baseUrl || !this.authToken) {
        await this.init();
      }

      if (!this.authToken) {
        throw new Error('Not authenticated');
      }

      info('Saving job to backend:', jobData.jobTitle);

      const response = await fetch(`${this.baseUrl}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          companyName: jobData.companyName,
          jobTitle: jobData.jobTitle,
          location: jobData.location,
          description: jobData.description,
          jobUrl: jobData.jobUrl,
          platform: jobData.platform || 'linkedin',
          appliedAt: jobData.appliedAt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      info('Job saved successfully:', result);
      return result;
    }

    /**
     * Get jobs (for dashboard)
     */
    async getJobs(page = 1, limit = 10) {
      if (!this.baseUrl || !this.authToken) {
        await this.init();
      }

      const response = await fetch(
        `${this.baseUrl}/api/jobs?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    }

    /**
     * Update job status
     */
    async updateJob(id, data) {
      if (!this.baseUrl || !this.authToken) {
        await this.init();
      }

      const response = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    }
  }

  info("Background service worker started");

  // Initialize services
  const apiClient = new ApiClient();
  const jobQueue = new JobQueue();

  // Override JobQueue's _sendJob to use ApiClient
  jobQueue._sendJob = async (job) => {
    const result = await apiClient.saveJob(job);
    
    // 💾 Increment cached job count on successful save
    const currentCount = await getLocal('jobCount');
    if (currentCount !== undefined && currentCount !== null) {
      await setLocal('jobCount', currentCount + 1);
      info('Job count cache incremented:', currentCount + 1);
    }
    
    return result;
  };

  // Initialize API client
  apiClient.init();

  // Register message handlers
  registerHandlers({
    'JOB_APPLICATION': handleJobApplication,
    'EXTERNAL_APPLY_CACHED': handleExternalApply,
    'UPDATE_BADGE': handleUpdateBadge,
    'CLEAR_BADGE': handleClearBadge,
    'RETRY_FAILED': handleRetryFailed
  });

  // ===============================
  // External Message Listener (for website auth)
  // ===============================
  chrome.runtime.onMessageExternal.addListener(
    async (request, sender, sendResponse) => {
      info('Received external message:', request.type);
      
      // Handle auth token from website
      if (request.type === 'AUTH_TOKEN' && request.token) {
        try {
          // Store token in chrome.storage.sync
          await chrome.storage.sync.set({ authToken: request.token });
          info('Auth token received and stored from website');
          
          // Notify all extension contexts that auth succeeded
          chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS' }).catch(() => {
            // Ignore errors if popup is not open
          });
          
          sendResponse({ success: true });
        } catch (error$1) {
          error('Failed to store auth token:', error$1);
          sendResponse({ success: false, error: error$1.message });
        }
        return true; // Keep channel open for async response
      }
      
      sendResponse({ success: false, error: 'Unknown message type' });
    }
  );

  // Handler functions

  async function handleJobApplication(data) {
    info('Received job application:', data.jobTitle);
    
    try {
      // Add to queue (will process automatically)
      await jobQueue.add(data);
      
      // Show success notification
      showNotification('success', data);
      
      return { success: true };
    } catch (error$1) {
      error('Failed to handle job application:', error$1);
      showNotification('error', null, error$1.message);
      throw error$1;
    }
  }

  async function handleExternalApply(data) {
    // Show browser notification for external apply
    showExternalApplyNotification(data.count);
    
    // Set badge on extension icon
    chrome.action.setBadgeText({ text: String(data.count) });
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
    
    return { success: true };
  }

  async function handleUpdateBadge(data) {
    const count = data.count || 0;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    if (count > 0) {
      chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
    }
    return { success: true };
  }

  async function handleClearBadge() {
    chrome.action.setBadgeText({ text: "" });
    return { success: true };
  }

  async function handleRetryFailed() {
    info('Retrying failed jobs');
    await jobQueue.retryFailed();
    return { success: true };
  }

  // Notification functions

  function showNotification(type, jobData, errorMessage) {
    const notificationOptions = {
      type: "basic",
      iconUrl: "icons/icon128.jpg",
      title: "",
      message: "",
      priority: 2
    };

    if (type === "success") {
      notificationOptions.title = "✅ Job Application Tracked!";
      notificationOptions.message = `${jobData.jobTitle} at ${jobData.companyName} has been saved to your dashboard.`;
    } else {
      notificationOptions.title = "❌ Failed to Track Application";
      notificationOptions.message = errorMessage || "Could not save job application. Please check your connection and try again.";
    }

    chrome.notifications.create(`jobtracker-${Date.now()}`, notificationOptions);
  }

  function showExternalApplyNotification(count) {
    const notificationOptions = {
      type: "basic",
      iconUrl: "icons/icon128.jpg",
      title: "💼 Job Saved - Action Required",
      message: `You have ${count} pending job${count > 1 ? 's' : ''} waiting for confirmation.\n\n✓ After you apply on their website, click the extension icon (with badge ⓵) to confirm and save to your dashboard.`,
      priority: 2,
      requireInteraction: true
    };

    chrome.notifications.create(`jobtracker-external-${Date.now()}`, notificationOptions);
  }

})();
