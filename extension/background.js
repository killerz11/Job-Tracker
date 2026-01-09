import { registerHandlers } from './core/messaging.js';
import { get } from './core/storage.js';
import { info, error as logError } from './core/logger.js';

console.log("[JobTracker] Background service worker started");

import { getBackendUrl } from './config.js';


registerHandlers({
  'JOB_APPLICATION': handleJobApplication,
  'EXTERNAL_APPLY_CACHED': handleExternalApply,
  'UPDATE_BADGE': handleUpdateBadge,
  'CLEAR_BADGE': handleClearBadge
});

// -------------------------------------
// Handler functions
// -------------------------------------

async function handleExternalApply(data) {
  // Show browser notification for external apply
  showExternalApplyNotification(data.count);
  
  // Set badge on extension icon to indicate pending jobs
  chrome.action.setBadgeText({ text: String(data.count) });
  chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  
  return { success: true };
}

async function handleUpdateBadge(data) {
  // Update badge count
  const count = data.count || 0;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  if (count > 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  }
  return { success: true };
}

async function handleClearBadge() {
  // Clear badge when all jobs are confirmed or cancelled
  chrome.action.setBadgeText({ text: "" });
  return { success: true };
}


// -------------------------------------
// Handle job application data
// -------------------------------------
async function handleJobApplication(jobData) {
  info('Processing job application:', jobData);

  const authToken = await get('authToken');

  if (!authToken) {
    throw new Error("Auth token not found in extension storage");
  }

  // Get backend URL from config
  const baseUrl = await getBackendUrl();
  info('Using backend URL:', baseUrl);

  // Send job data to backend with JWT auth
  const response = await fetch(`${baseUrl}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      location: jobData.location,
      description: jobData.description,
      jobUrl: jobData.jobUrl,
      platform: jobData.platform || "linkedin",
      appliedAt: jobData.appliedAt,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to save job application";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }

  const result = await response.json();
  info('Job saved successfully:', result);

  return result;
}

// -------------------------------------
// Show notification to user
// -------------------------------------
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

// -------------------------------------
// Show notification for external apply
// -------------------------------------
function showExternalApplyNotification(count) {
  const notificationOptions = {
    type: "basic",
    iconUrl: "icons/icon128.jpg",
    title: "💼 Job Saved - Action Required",
    message: `You have ${count} pending job${count > 1 ? 's' : ''} waiting for confirmation.\n\n✓ After you apply on their website, click the extension icon (with badge ⓵) to confirm and save to your dashboard.`,
    priority: 2,
    requireInteraction: true // Keeps notification visible until user interacts
  };

  chrome.notifications.create(`jobtracker-external-${Date.now()}`, notificationOptions);
}
