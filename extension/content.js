// =====================================
// JobTracker – LinkedIn Job Application Tracker
// =====================================

console.log("[JobTracker] Content script loaded");

// Check if extension context is valid on load
try {
  chrome.runtime.getManifest();
} catch (error) {
  console.error("[JobTracker] Extension context invalid on load");
  // Show persistent warning banner
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showExtensionInvalidWarning);
  } else {
    showExtensionInvalidWarning();
  }
}

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

let isProcessing = false;
let cachedJobData = null;
let lastApplyType = null;

/**
 * Extract job details (SAFE + RELIABLE)
 */
function extractJobDetails() {
  const jobDetails = {
    jobTitle:
      document.querySelector("h1")?.innerText.trim() ||
      document.querySelector(".job-details-jobs-unified-top-card__job-title")?.innerText.trim() ||
      "",

    companyName:
      document.querySelector(
        ".job-details-jobs-unified-top-card__company-name a"
      )?.innerText.trim() ||
      document.querySelector('a[href*="/company/"]')?.innerText.trim() ||
      document.querySelector(".job-details-jobs-unified-top-card__company-name")?.innerText.trim() ||
      "",

    location:
      document.querySelector(
        ".job-details-jobs-unified-top-card__bullet"
      )?.innerText.trim() ||
      document.querySelector(
        ".job-details-jobs-unified-top-card__primary-description"
      )?.innerText.trim() ||
      document.querySelector(
        '[class*="job-details"][class*="location"]'
      )?.innerText.trim() ||
      document.querySelector(
        '.jobs-unified-top-card__bullet'
      )?.innerText.trim() ||
      document.querySelector(
        '.jobs-unified-top-card__workplace-type'
      )?.innerText.trim() ||
      // Try to find location in any element with "location" in class name
      Array.from(document.querySelectorAll('[class*="location"]'))
        .find(el => el.innerText && el.innerText.length < 100)
        ?.innerText.trim() ||
      "",

    description:
      document
        .querySelector(".jobs-description-content__text")
        ?.innerText.trim()
        .slice(0, 5000) || "",

    jobUrl: location.href,
    appliedAt: new Date().toISOString(),
  };

  // Log extracted data for debugging
  console.log("[JobTracker] Extracted job details:", {
    jobTitle: jobDetails.jobTitle,
    companyName: jobDetails.companyName,
    location: jobDetails.location || "(no location found)",
    hasDescription: !!jobDetails.description,
    jobUrl: jobDetails.jobUrl
  });

  return jobDetails;
}

/**
 * Cache job data when Easy Apply starts
 */
function cacheJobData() {
  const data = extractJobDetails();

  if (data.jobTitle && data.companyName) {
    cachedJobData = data;
    console.log("[JobTracker] Job data cached:", {
      jobTitle: cachedJobData.jobTitle,
      companyName: cachedJobData.companyName,
    });
  } else {
    console.warn("[JobTracker] Could not cache job data - missing title or company");
  }
}

/**
 * Detect Easy Apply success with MutationObserver
 */
function waitForEasyApplySuccess() {
  return new Promise((resolve) => {
    const checkSuccess = () => {
      const text = document.body.innerText.toLowerCase();
      
      // Check for modal close (submit button disappears)
      const submitButton = document.querySelector('button[aria-label*="Submit application"]');
      const modalGone = !document.querySelector('[role="dialog"][aria-labelledby*="apply"]');
      
      // Multiple success indicators
      const hasSuccessMessage = 
        text.includes("your profile was shared") ||
        text.includes("application submitted") ||
        text.includes("application sent") ||
        text.includes("your application was sent") ||
        text.includes("application was sent to") ||
        text.includes("your job application was sent") ||
        // Check if modal closed after submit
        (!submitButton && modalGone);
      
      if (hasSuccessMessage) {
        console.log("[JobTracker] Success detected! Modal closed or success message found");
      }
      
      return hasSuccessMessage;
    };

    // Wait a moment for LinkedIn to process
    setTimeout(() => {
      // Check immediately after delay
      if (checkSuccess()) {
        resolve(true);
        return;
      }

      console.log("[JobTracker] Waiting for success confirmation...");

      // Watch for changes
      const observer = new MutationObserver(() => {
        if (checkSuccess()) {
          observer.disconnect();
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout after 8 seconds
      setTimeout(() => {
        observer.disconnect();
        console.log("[JobTracker] Timeout - assuming success (modal likely closed)");
        // If we got this far and modal is gone, assume success
        const modalStillOpen = document.querySelector('[role="dialog"][aria-labelledby*="apply"]');
        resolve(!modalStillOpen);
      }, 8000);
    }, 1500); // Initial delay to let LinkedIn process
  });
}

/**
 * FINAL handler – ONLY after submit
 */
async function handleSubmitApplication() {
  if (isProcessing) {
    console.log("[JobTracker] Already processing, skipping");
    return;
  }
  if (lastApplyType !== "EASY_APPLY") {
    console.log("[JobTracker] Not an Easy Apply flow, skipping");
    return;
  }
  
  isProcessing = true;
  console.log("[JobTracker] Submit clicked - processing application");

  // Wait a bit for LinkedIn to process, then check if modal closed
  await new Promise(r => setTimeout(r, 2000));

  // Check if the Easy Apply modal is still open
  const modalStillOpen = document.querySelector('[role="dialog"]');
  const hasErrorMessage = document.body.innerText.toLowerCase().includes("please enter") ||
                          document.body.innerText.toLowerCase().includes("required") ||
                          document.body.innerText.toLowerCase().includes("this field");

  if (modalStillOpen && hasErrorMessage) {
    console.log("[JobTracker] Form has errors - not submitted");
    isProcessing = false;
    lastApplyType = null;
    return;
  }

  // If modal is gone or no errors, assume success
  if (!modalStillOpen || !hasErrorMessage) {
    console.log("[JobTracker] Application appears to be submitted (modal closed or no errors)");
  }

  const jobData = cachedJobData || extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Incomplete job data", jobData);
    isProcessing = false;
    lastApplyType = null;
    return;
  }

  console.log("[JobTracker] Sending job data to background:", {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
  });

  try {
    chrome.runtime.sendMessage(
      {
        type: "JOB_APPLICATION",
        data: jobData,
      },
      (response) => {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          console.error("[JobTracker] Runtime error:", chrome.runtime.lastError);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
          return;
        }

        console.log("[JobTracker] Background response:", response);
        
        // Show visual feedback on the page
        if (response?.success) {
          showPageNotification("✅ Job tracked successfully!", "success");
        } else {
          showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
        }
      }
    );
  } catch (error) {
    console.error("[JobTracker] Failed to send message:", error);
    showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
  }

  isProcessing = false;
  lastApplyType = null;
}

/**
 * Handle external apply button clicks
 */
function handleExternalApply() {
  console.log("[JobTracker] External apply triggered");
  lastApplyType = "EXTERNAL_APPLY";

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for external apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  console.log("[JobTracker] Caching external apply job:", {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
  });

  // Add to pending jobs array
  try {
    chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
      // Check if extension context is still valid
      if (chrome.runtime.lastError) {
        console.error("[JobTracker] Extension context invalidated:", chrome.runtime.lastError);
        showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
        return;
      }

      const jobs = pendingJobs || [];
      
      // Add unique ID and timestamp
      const newJob = {
        ...jobData,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        platform: "linkedin",
        status: "APPLIED",
        timestamp: Date.now(),
      };
      
      // Check if job already exists (same URL)
      const exists = jobs.some(job => job.jobUrl === newJob.jobUrl);
      if (exists) {
        console.log("[JobTracker] Job already in pending queue");
        showPageNotification("⚠️ Job already saved", "error");
        return;
      }
      
      jobs.push(newJob);
      
      chrome.storage.local.set({ pendingJobs: jobs }, () => {
        if (chrome.runtime.lastError) {
          console.error("[JobTracker] Failed to save:", chrome.runtime.lastError);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
          return;
        }

        console.log("[JobTracker] External apply job cached successfully. Total pending:", jobs.length);
        
        // Show notification
        showExternalApplyNotification(jobData);
        
        // Update badge and send to background
        try {
          chrome.runtime.sendMessage({ 
            type: "EXTERNAL_APPLY_CACHED",
            count: jobs.length
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("[JobTracker] Message failed:", chrome.runtime.lastError);
              // Still show success since job was saved locally
            }
          });
        } catch (error) {
          console.error("[JobTracker] Failed to send message:", error);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
        }
      });
    });
  } catch (error) {
    console.error("[JobTracker] Extension context error:", error);
    showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
  }
}

/**
 * Show prominent notification for external apply
 */
function showExternalApplyNotification(jobData) {
  // Remove existing notification if any
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

  // Add animation
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

  // Auto-remove after 8 seconds (longer to give user time to read)
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => notification.remove(), 300);
  }, 8000);
}

/**
 * Check for pending jobs when returning to LinkedIn
 */
function checkForPendingJob() {
  chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
    if (pendingJobs && pendingJobs.length > 0) {
      console.log("[JobTracker] Found pending jobs:", pendingJobs.length);
      // Wait a bit for page to load
      setTimeout(() => {
        showFinalConfirmationModal(pendingJobs[0]);
      }, 1000);
    }
  });
}

/**
 * Show final confirmation modal when user returns
 */
function showFinalConfirmationModal(jobData) {
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

  // Handle Yes button - save to database
  document.getElementById("jobtracker-confirm-yes").addEventListener("click", () => {
    const btn = document.getElementById("jobtracker-confirm-yes");
    btn.textContent = "Saving...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
      chrome.runtime.sendMessage(
        { type: "JOB_APPLICATION", data: jobData },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("[JobTracker] Runtime error:", chrome.runtime.lastError);
            showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
            modal.remove();
            return;
          }

          if (response?.success) {
            showPageNotification("✅ Job tracked successfully!", "success");
            
            // Remove this job from pending jobs array
            chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
              const jobs = pendingJobs || [];
              const updatedJobs = jobs.filter(job => job.id !== jobData.id);
              chrome.storage.local.set({ pendingJobs: updatedJobs }, () => {
                try {
                  chrome.runtime.sendMessage({ type: "UPDATE_BADGE", count: updatedJobs.length });
                } catch (error) {
                  console.error("[JobTracker] Failed to update badge:", error);
                }
              });
            });
          } else {
            showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
          }
          modal.remove();
        }
      );
    } catch (error) {
      console.error("[JobTracker] Failed to send message:", error);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
      modal.remove();
    }
  });

  // Handle No button - discard
  document.getElementById("jobtracker-confirm-no").addEventListener("click", () => {
    try {
      // Remove this job from pending jobs array
      chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
        const jobs = pendingJobs || [];
        const updatedJobs = jobs.filter(job => job.id !== jobData.id);
        chrome.storage.local.set({ pendingJobs: updatedJobs }, () => {
          try {
            chrome.runtime.sendMessage({ type: "UPDATE_BADGE", count: updatedJobs.length });
          } catch (error) {
            console.error("[JobTracker] Failed to update badge:", error);
          }
        });
      });
      showPageNotification("Application not tracked", "error");
      modal.remove();
    } catch (error) {
      console.error("[JobTracker] Failed to remove job:", error);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
      modal.remove();
    }
  });

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      // Don't clear - let them decide later
      modal.remove();
    }
  });
}

// Check for pending job when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkForPendingJob);
} else {
  checkForPendingJob();
}

/**
 * Show notification on LinkedIn page
 */
function showPageNotification(message, type) {
  // Remove existing notification if any
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

  // Add animation
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

  const text = button.innerText?.toLowerCase().trim() || "";
  const aria = button.getAttribute("aria-label")?.toLowerCase() || "";
  const classes = button.className || "";

  // Debug logging - log ALL button clicks on LinkedIn
  console.log("[JobTracker] Button clicked:", {
    text: text.substring(0, 50),
    aria: aria.substring(0, 50),
    hasJobsApplyClass: classes.includes("jobs-apply"),
  });

  // Easy Apply START → cache job data
  // Check multiple patterns
  if (
    text.includes("easy apply") || 
    aria.includes("easy apply") ||
    (classes.includes("jobs-apply-button") && text === "easy apply")
  ) {
    console.log("[JobTracker] ✅ Easy Apply button detected!");
    lastApplyType = "EASY_APPLY";
    cacheJobData();
    return;
  }

  // FINAL submit (more specific detection)
  if (
    text.includes("submit application") ||
    aria.includes("submit application") ||
    text === "submit" ||
    text === "submit application"
  ) {
    console.log("[JobTracker] ✅ Submit button detected!");
    handleSubmitApplication();
    return;
  }

  // External Apply (redirect flow)
  // Check for apply buttons that are NOT easy apply
  if (
    (text === "apply" || 
     text === "apply now" || 
     text.startsWith("apply") ||
     aria.includes("apply to") ||
     (classes.includes("jobs-apply-button") && !text.includes("easy"))) &&
    !text.includes("easy apply") &&
    !aria.includes("easy apply") &&
    !text.includes("submit")
  ) {
    console.log("[JobTracker] ✅ External Apply button detected!");
    handleExternalApply();
    return;
  }
}, true); // Use capture phase to catch events earlier

console.log("[JobTracker] Event listeners attached");
