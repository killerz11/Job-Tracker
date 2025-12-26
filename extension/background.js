// =====================================
// JobTracker – Background Service Worker
// =====================================

console.log("[JobTracker] Background service worker started");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "JOB_APPLICATION") {
    handleJobApplication(message.data)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Keep the message channel open for async response
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

  // if (!authToken) {
  //   throw new Error("Auth token not found in extension storage");
  // }

  const baseUrl = apiUrl || "http://localhost:3000";

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
      platform: "linkedin",
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
