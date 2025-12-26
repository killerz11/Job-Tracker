// =====================================
// JobTracker – LinkedIn Easy Apply ONLY
// =====================================

console.log("[JobTracker] Content script loaded (Easy Apply only)");

let isProcessing = false;
let cachedJobData = null;

/**
 * Extract job details (SAFE + RELIABLE)
 */
function extractJobDetails() {
  return {
    jobTitle:
      document.querySelector("h1")?.innerText.trim() || "",

    companyName:
      document.querySelector(
        ".job-details-jobs-unified-top-card__company-name a"
      )?.innerText.trim() ||
      document.querySelector('a[href*="/company/"]')?.innerText.trim() ||
      "",

    location:
      document.querySelector(
        ".job-details-jobs-unified-top-card__bullet"
      )?.innerText.trim() || "",

    description:
      document
        .querySelector(".jobs-description-content__text")
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
    console.log("[JobTracker] Job data cached", cachedJobData);
  }
}

/**
 * Detect Easy Apply success
 */
function isEasyApplySuccess() {
  const text = document.body.innerText.toLowerCase();
  return (
    text.includes("your profile was shared") ||
    text.includes("application submitted") ||
    text.includes("did you apply") ||
    text.includes("applied")
  );
}

/**
 * FINAL handler – ONLY after submit
 */
async function handleSubmitApplication() {
  if (isProcessing) return;
  isProcessing = true;

  console.log("[JobTracker] Submit application clicked");

  await new Promise((r) => setTimeout(r, 3000));

  if (!isEasyApplySuccess()) {
    console.log("[JobTracker] Easy Apply not completed");
    isProcessing = false;
    return;
  }

  const jobData = cachedJobData || extractJobDetails();

  if (!jobData?.jobTitle || !jobData?.companyName) {
    console.warn("[JobTracker] Incomplete job data", jobData);
    isProcessing = false;
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: "JOB_APPLICATION",
      data: jobData,
    },
    (response) => {
      console.log("[JobTracker] Background response:", response);
    }
  );

  isProcessing = false;
}

/**
 * GLOBAL click listener
 */
document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const text = button.innerText?.toLowerCase() || "";
  const aria = button.getAttribute("aria-label")?.toLowerCase() || "";

  // Easy Apply START → cache job data
  if (text.includes("easy apply") || aria.includes("easy apply")) {
    cacheJobData();
  }

  // FINAL submit
  if (
    text.includes("submit application") ||
    aria.includes("submit application")
  ) {
    handleSubmitApplication();
  }
});
