/**
 * Shared business logic utilities
 * UI functions have been moved to ui/notifications.js and ui/modals.js
 */

import { showPageNotification, showExternalApplyNotification } from './ui/notifications.js';
import { showConfirmationModal } from './ui/modals.js';
import { info, error as logError } from './core/logger.js';

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
          logError("Runtime error:", chrome.runtime.lastError);
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
  } catch (error) {
    logError("Failed to send message:", error);
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
        logError("Extension context invalidated:", chrome.runtime.lastError);
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
          logError("Failed to save:", chrome.runtime.lastError);
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
        } catch (error) {
          logError("Failed to send message:", error);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
        }
      });
    });
  } catch (error) {
    logError("Extension context error:", error);
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

// Export functions for use in content scripts
export {
  sendJobToBackground,
  cacheExternalApplyJob,
  checkForPendingJob
};
