import { registerHandlers } from './core/messaging.js';
import { info, error as logError } from './core/logger.js';
import { JobQueue } from './services/JobQueue.js';
import { ApiClient } from './services/ApiClient.js';

info("Background service worker started");

// Initialize services
const apiClient = new ApiClient();
const jobQueue = new JobQueue();

// Override JobQueue's _sendJob to use ApiClient
jobQueue._sendJob = async (job) => {
  return await apiClient.saveJob(job);
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

// Handler functions

async function handleJobApplication(data) {
  info('Received job application:', data.jobTitle);
  
  try {
    // Add to queue (will process automatically)
    await jobQueue.add(data);
    
    // Show success notification
    showNotification('success', data);
    
    return { success: true };
  } catch (error) {
    logError('Failed to handle job application:', error);
    showNotification('error', null, error.message);
    throw error;
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
