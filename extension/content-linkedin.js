// =====================================
// JobTracker – LinkedIn Job Application Tracker
// =====================================

console.log("[JobTracker] Content script loaded");

// Check if extension context is valid on load
let extensionContextValid = true;
try {
  chrome.runtime.getManifest();
  console.log("[JobTracker] Extension version:", chrome.runtime.getManifest().version);
  console.log("[JobTracker] Running on:", window.location.href);
} catch (error) {
  extensionContextValid = false;
  console.error("[JobTracker] Extension context invalid on load");
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
 * Extract job details (SAFE + RELIABLE)
 */
function extractJobDetails() {

  const locEl = document.querySelector(
    'span[dir="ltr"] span.tvm__text--low-emphasis'
  );

  const locationText =
    locEl?.innerText.split("·")[0].trim();

  const jobTitle =
    document.querySelector(
      "h1.t-24.t-bold"
    )?.innerText.trim() || "";

  const company =
    document.querySelector(
      ".job-details-jobs-unified-top-card__company-name a"
    )?.innerText.trim() || "";

  return {
    jobTitle,
    companyName: company,
    location: locationText,
    description:
      document.querySelector(".jobs-description-content__text")
        ?.innerText.trim()
        .slice(0, 5000) || "",
    jobUrl: location.href,
    appliedAt: new Date().toISOString(),
  };
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
    console.log("[JobTracker] Not an Easy Apply flow, skipping");
    return;
  }

  console.log("[JobTracker] Submit clicked - processing application");

  // 2) Wait for LinkedIn internal processing
  await new Promise(r => setTimeout(r, 1000));

  // 3) ---- ABSOLUTE CONFIRMATION LOGIC ----

  const confirmed = await waitForLinkedInSuccessModal();

  if (!confirmed) {
    console.log("[JobTracker] ❌ LinkedIn did not show success banner");
    return;
  }

  console.log("[JobTracker] ✅ LinkedIn submission confirmed");

  // 4) Get job data only after success
  const jobData = cachedJobData || extractJobDetails();

  // 5) Validate critical fields
  if (!jobData || !jobData.jobTitle || !jobData.companyName) {
    console.warn("[JobTracker] Incomplete job data:", jobData);
    lastApplyType = null;
    return;
  }

  // 6) Add to processing queue
  processingQueue.push({
    data: jobData,
    platform: "linkedin",
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
  console.log("[JobTracker] External apply triggered");
  lastApplyType = "EXTERNAL_APPLY";

  const jobData = extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Missing job data for external apply");
    showPageNotification("⚠️ Could not extract job details", "error");
    return;
  }

  cacheExternalApplyJob(jobData, "linkedin");
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
