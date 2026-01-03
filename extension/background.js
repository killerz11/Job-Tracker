// =====================================
// JobTracker – Background Service Worker
// =====================================

console.log("[JobTracker] Background service worker started");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "JOB_APPLICATION") {
    handleJobApplication(message.data)
      .then((result) => {
        // Show success notification
        showNotification("success", result);
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        // Show error notification
        showNotification("error", null, error.message);
        sendResponse({ success: false, error: error.message });
      });

    // Keep the message channel open for async response
    return true;
  }

  if (message.type === "EXTERNAL_APPLY_CACHED") {
    // Show browser notification for external apply
    showExternalApplyNotification(message.count);
    
    // Set badge on extension icon to indicate pending jobs
    chrome.action.setBadgeText({ text: String(message.count) });
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
    
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "UPDATE_BADGE") {
    // Update badge count
    const count = message.count || 0;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    if (count > 0) {
      chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === "CLEAR_BADGE") {
    // Clear badge when all jobs are confirmed or cancelled
    chrome.action.setBadgeText({ text: "" });
    sendResponse({ success: true });
    return true;
  }
});

// -------------------------------------
// Handle job application data
// -------------------------------------
async function handleJobApplication(jobData) {
  console.log("[JobTracker] Processing job application:", jobData);

  // Get API URL and auth token from storage
  const { apiUrl, authToken } = await chrome.storage.sync.get([
    "apiUrl",
    "authToken",
  ]);

  if (!authToken) {
    throw new Error("Auth token not found in extension storage");
  }

  const baseUrl = apiUrl || "http://localhost:4000";

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
  console.log("[JobTracker] Job saved successfully:", result);

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
