// =====================================
// JobTracker – Naukri Job Application Tracker
// =====================================

console.log("[JobTracker] Naukri content script loaded");
console.log("[JobTracker] Running on:", window.location.href);

let isProcessing = false;
let lastApplyType = null;
let processingQueue = [];

/**
 * Process job queue
 */
async function processJobQueue() {
  if (isProcessing || processingQueue.length === 0) return;
  
  isProcessing = true;
  const job = processingQueue.shift();
  
  console.log(`[JobTracker] Processing Naukri job from queue (${processingQueue.length} remaining):`, job.jobTitle);
  
  try {
    await sendJobToBackground(job.data, job.platform);
  } catch (error) {
    console.error("[JobTracker] Failed to process job:", error);
  }
  
  isProcessing = false;
  
  // Process next job in queue (reduced delay)
  if (processingQueue.length > 0) {
    setTimeout(processJobQueue, 100); // Reduced from 500ms to 100ms
  }
}

/**
 * Extract job details from Naukri page
 */
function extractJobDetails() {
  const jobDetails = {
    jobTitle:
      document.querySelector("h1")?.innerText.trim() ||
      document.querySelector('[class*="title"]')?.innerText.trim() ||
      "",

    companyName: (() => {
      // Get company name element
      const companyEl = document.querySelector('[class="styles_jd-header-comp-name__MvqAI"]');
      if (!companyEl) return "";
      
      let companyText = companyEl.innerText.trim();
      
      // Remove "X.X Reviews" pattern (e.g., "4.329 Reviews")
      companyText = companyText.replace(/\d+\.?\d*\s*Reviews?/gi, '').trim();
      
      return companyText;
    })(),

    location:
      document.querySelector('[class="styles_jhc__location__W_pVs"]')?.innerText.trim() ||
      document.querySelector(".loc-wrap")?.innerText.trim() ||
      document.querySelector(".location")?.innerText.trim() ||
      document.querySelector('[class*="location"]')?.innerText.trim() ||
      "",

    description:
      document.querySelector('[class*="jd-"]')?.innerText.trim().slice(0, 5000) ||
      document.querySelector(".dang-inner-html")?.innerText.trim().slice(0, 5000) ||
      document.querySelector(".job-description")?.innerText.trim().slice(0, 5000) ||
      document.querySelector('[class*="description"]')?.innerText.trim().slice(0, 5000) ||
      "",

    jobUrl: location.href,
    appliedAt: new Date().toISOString(),
  };

  console.log("[JobTracker] Extracted Naukri job details:", {
    jobTitle: jobDetails.jobTitle,
    companyName: jobDetails.companyName,
    location: jobDetails.location || "(no location found)",
    hasDescription: !!jobDetails.description,
    jobUrl: jobDetails.jobUrl
  });

  return jobDetails;
}

/**
 * Handle direct apply button click (applies on Naukri directly)
 */
function handleDirectApply() {
  lastApplyType = "DIRECT_APPLY";
  console.log("[JobTracker] Naukri direct apply button clicked");

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for Naukri apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  // Add to queue instead of processing immediately
  processingQueue.push({
    data: jobData,
    platform: "naukri",
    jobTitle: jobData.jobTitle
  });
  
  console.log(`[JobTracker] Added to queue (${processingQueue.length} jobs pending)`);
  
  lastApplyType = null;
  
  // Wait for Naukri to process, then start queue (reduced delay)
  setTimeout(() => {
    processJobQueue();
  }, 1000); // Reduced from 2000ms to 1000ms
}

/**
 * Handle external apply button click (redirects to company site)
 */
function handleExternalApply() {
  lastApplyType = "EXTERNAL_APPLY";
  console.log("[JobTracker] Naukri external apply button clicked");

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for Naukri apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  // Cache job for later confirmation (like LinkedIn external apply)
  cacheExternalApplyJob(jobData, "naukri");
  
  lastApplyType = null;
}

/**
 * Detect apply button clicks
 * 
 * Naukri apply button patterns:
 * - "Apply on company site"
 * - class: "company-site-button"
 * - id: "company-site-button"
 */
document.addEventListener("click", (e) => {
  let button = e.target;
  
  // Traverse up to find button (max 5 levels)
  for (let i = 0; i < 5 && button && button !== document.body; i++) {
    if (button.tagName === "BUTTON" || 
        button.tagName === "A" || 
        button.getAttribute("role") === "button") {
      break;
    }
    button = button.parentElement;
  }

  if (!button) return;

  const text = button.innerText?.toLowerCase().trim() || "";
  const classes = button.className || "";
  const id = button.id || "";

  // Debug logging - log ALL button clicks on Naukri
  console.log("[JobTracker] Naukri button clicked:", {
    text: text.substring(0, 50),
    classes: classes.substring(0, 100),
    id: id,
    tagName: button.tagName
  });

  // Check for "Apply on company site" button (external redirect)
  if (
    text === "apply on company site" ||
    text.includes("company site") ||
    classes.includes("company-site-button") ||
    id === "company-site-button"
  ) {
    console.log("[JobTracker] ✅ Naukri External Apply button detected!");
    handleExternalApply();
    return;
  }

  // Check for direct "Apply" button (applies on Naukri)
  if (
    text === "apply" ||
    text === "apply now" ||
    (text.includes("apply") && !text.includes("company site")) ||
    classes.includes("apply-button") ||
    id.includes("apply")
  ) {
    console.log("[JobTracker] ✅ Naukri Direct Apply button detected!");
    handleDirectApply();
    return;
  }
}, true);

console.log("[JobTracker] Naukri event listeners attached");


// Check for pending job when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkForPendingJob);
} else {
  checkForPendingJob();
}
