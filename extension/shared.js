// =====================================
// Shared utilities for JobTracker
// =====================================

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

  // Auto-remove after 3 seconds (reduced from 5s)
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

  // Auto-remove after 5 seconds (reduced from 8s)
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease-out reverse";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Send job application to background
 */
async function sendJobToBackground(jobData, platform) {
  console.log(`[JobTracker] Sending ${platform} job data to background:`, {
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
          console.error("[JobTracker] Runtime error:", chrome.runtime.lastError);
          showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
          return;
        }

        console.log("[JobTracker] Background response:", response);
        
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
}

/**
 * Cache external apply job
 */
function cacheExternalApplyJob(jobData, platform) {
  console.log(`[JobTracker] Caching ${platform} external apply job:`, {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
  });

  try {
    chrome.storage.local.get("pendingJobs", ({ pendingJobs }) => {
      if (chrome.runtime.lastError) {
        console.error("[JobTracker] Extension context invalidated:", chrome.runtime.lastError);
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
        
        showExternalApplyNotification(jobData);
        
        try {
          chrome.runtime.sendMessage({ 
            type: "EXTERNAL_APPLY_CACHED",
            count: jobs.length
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("[JobTracker] Message failed:", chrome.runtime.lastError);
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
 * Check for pending jobs when page loads
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
