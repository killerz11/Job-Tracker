// Popup script
import { getBackendUrl, getDashboardUrl } from './config.js';
import { getLocal } from './core/storage.js';
import { info } from './core/logger.js';

// URLs are now managed by config.js
let BACKEND_URL;
let DASHBOARD_URL;

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize URLs from config
  BACKEND_URL = await getBackendUrl();
  DASHBOARD_URL = await getDashboardUrl();
  
  info('Using backend:', BACKEND_URL);
  info('Using dashboard:', DASHBOARD_URL);
  
  // ===============================
  // Check for pending jobs FIRST
  // ===============================
  const pendingJobs = await getLocal("pendingJobs");
  
  if (pendingJobs && pendingJobs.length > 0) {
    // Show pending jobs list UI
    showPendingJobsUI(pendingJobs);
    return; // Don't show normal popup until pending jobs are handled
  }

  // Clear badge only if no pending jobs
  chrome.action.setBadgeText({ text: "" });

  // ===============================
  // Normal popup flow
  // ===============================

  const { authToken } = await chrome.storage.sync.get(["authToken"]);

  if (authToken) {
    await checkConnectionStatus(authToken);
  } else {
    // Show not logged in state
    const statusEl = document.getElementById("authStatus");
    const countEl = document.getElementById("appCount");
    if (statusEl) {
      statusEl.textContent = "Not logged in";
      statusEl.classList.add("disconnected");
    }
    if (countEl) {
      countEl.textContent = "-";
    }
  }

  // Open dashboard
  document.getElementById("openDashboard")?.addEventListener("click", async () => {
    const { authToken } = await chrome.storage.sync.get(["authToken"]);

    if (!authToken) {
      // Open login page for new users
      chrome.tabs.create({ url: `${DASHBOARD_URL}/login` });
      return;
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) {
      // Session expired, open login page
      chrome.tabs.create({ url: `${DASHBOARD_URL}/login` });
      return;
    }

    // Authenticated, open dashboard
    chrome.tabs.create({ url: `${DASHBOARD_URL}/dashboard` });
  });

  // Login
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert("Login failed: " + (errorData.error || "Invalid credentials"));
        return;
      }

      const { token } = await res.json();
      await chrome.storage.sync.set({ authToken: token });
      await checkConnectionStatus(token);
      
      // Clear password field
      document.getElementById("password").value = "";
    } catch (error) {
      alert("Connection error: " + error.message);
    }
  });
});

// ===============================
// Pending Jobs UI (Multiple Jobs)
// ===============================

function showPendingJobsUI(jobs) {
  const content = document.getElementById("content");
  
  content.innerHTML = `
    <div class="header">
      <h1>JobTracker</h1>
    </div>
    
    <div style="text-align: center; margin: 16px 0 20px 0;">
      <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 6px 0;">
        Pending Applications
      </h2>
      <p style="font-size: 13px; color: #6b7280; margin: 0;">
        ${jobs.length} job${jobs.length > 1 ? 's' : ''} waiting for confirmation
      </p>
    </div>

    <div id="jobsList" style="
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 16px;
      padding-right: 4px;
    ">
      ${jobs.map((job, index) => `
        <div class="job-card" data-job-id="${job.id}" style="
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
        ">
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">COMPANY</div>
            <div style="font-size: 15px; font-weight: 600; color: #111827;">${job.companyName}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">POSITION</div>
            <div style="font-size: 14px; font-weight: 500; color: #111827;">${job.jobTitle}</div>
          </div>
          ${job.location ? `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; font-weight: 600;">LOCATION</div>
            <div style="font-size: 13px; color: #111827;">${job.location}</div>
          </div>
          ` : ''}
          <div style="font-size: 11px; color: #9ca3af; margin-bottom: 12px;">
            Saved ${getTimeAgo(job.timestamp)}
          </div>
          
          <div style="display: flex; gap: 8px;">
            <button class="confirm-yes" data-job-id="${job.id}" style="
              flex: 1;
              padding: 10px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            ">
              ✓ Applied
            </button>
            <button class="confirm-no" data-job-id="${job.id}" style="
              flex: 1;
              padding: 10px;
              background: #f3f4f6;
              color: #374151;
              border: none;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            ">
              ✗ Didn't Apply
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
      <button id="confirmAllYes" style="
        flex: 1;
        padding: 10px;
        background: #059669;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      ">
        ✓ Confirm All
      </button>
      <button id="clearAll" style="
        flex: 1;
        padding: 10px;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      ">
        ✗ Clear All
      </button>
    </div>

    <div id="statusMessage" style="
      margin-top: 12px;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      display: none;
    "></div>
  `;

  // Add custom scrollbar styles
  const style = document.createElement("style");
  style.textContent = `
    #jobsList::-webkit-scrollbar {
      width: 6px;
    }
    #jobsList::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 3px;
    }
    #jobsList::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    #jobsList::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
    .job-card:hover {
      background: #f3f4f6 !important;
      border-color: #d1d5db !important;
    }
    .confirm-yes:hover {
      background: #1d4ed8 !important;
    }
    .confirm-no:hover {
      background: #e5e7eb !important;
    }
    #confirmAllYes:hover {
      background: #047857 !important;
    }
    #clearAll:hover {
      background: #dc2626 !important;
    }
  `;
  document.head.appendChild(style);

  // Handle individual Yes buttons
  document.querySelectorAll(".confirm-yes").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const jobId = e.target.dataset.jobId;
      await handleConfirmJob(jobId, true);
    });
  });

  // Handle individual No buttons
  document.querySelectorAll(".confirm-no").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const jobId = e.target.dataset.jobId;
      await handleConfirmJob(jobId, false);
    });
  });

  // Handle Confirm All
  document.getElementById("confirmAllYes")?.addEventListener("click", async () => {
    const btn = document.getElementById("confirmAllYes");
    btn.textContent = "Saving all...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    let successCount = 0;
    let failCount = 0;

    for (const job of jobs) {
      const success = await saveJobToBackend(job);
      if (success) successCount++;
      else failCount++;
    }

    await chrome.storage.local.set({ pendingJobs: [] });
    await chrome.action.setBadgeText({ text: "" });

    showStatusMessage(
      `✅ ${successCount} job${successCount !== 1 ? 's' : ''} saved${failCount > 0 ? `, ${failCount} failed` : ''}`,
      "success"
    );

    setTimeout(() => window.location.reload(), 1500);
  });

  // Handle Clear All
  document.getElementById("clearAll")?.addEventListener("click", async () => {
    if (confirm(`Clear all ${jobs.length} pending applications?`)) {
      await chrome.storage.local.set({ pendingJobs: [] });
      await chrome.action.setBadgeText({ text: "" });
      showStatusMessage("All pending jobs cleared", "info");
      setTimeout(() => window.location.reload(), 1000);
    }
  });
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function handleConfirmJob(jobId, shouldSave) {
  const { pendingJobs } = await chrome.storage.local.get("pendingJobs");
  const job = pendingJobs.find(j => j.id === jobId);
  
  if (!job) return;

  const card = document.querySelector(`[data-job-id="${jobId}"]`);
  
  if (shouldSave) {
    // Save to backend
    card.style.opacity = "0.6";
    const success = await saveJobToBackend(job);
    
    if (success) {
      card.style.background = "#d1fae5";
      card.style.borderColor = "#10b981";
      setTimeout(() => removeJobFromList(jobId), 500);
    } else {
      card.style.opacity = "1";
      showStatusMessage("❌ Failed to save job", "error");
    }
  } else {
    // Just remove
    card.style.background = "#fee2e2";
    card.style.borderColor = "#ef4444";
    setTimeout(() => removeJobFromList(jobId), 500);
  }
}

async function saveJobToBackend(jobData) {
  try {
    const { authToken } = await chrome.storage.sync.get(["authToken"]);
    
    if (!authToken) {
      showStatusMessage("❌ Please login first", "error");
      return false;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/jobs`, {
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

    return response.ok;
  } catch (error) {
    console.error("Failed to save job:", error);
    return false;
  }
}

async function removeJobFromList(jobId) {
  const { pendingJobs } = await chrome.storage.local.get("pendingJobs");
  const updatedJobs = pendingJobs.filter(j => j.id !== jobId);
  
  await chrome.storage.local.set({ pendingJobs: updatedJobs });
  await chrome.action.setBadgeText({ text: updatedJobs.length > 0 ? String(updatedJobs.length) : "" });
  
  // Remove card from UI
  const card = document.querySelector(`[data-job-id="${jobId}"]`);
  if (card) {
    card.style.transform = "translateX(400px)";
    card.style.opacity = "0";
    setTimeout(() => {
      card.remove();
      
      // If no more jobs, reload to normal view
      if (updatedJobs.length === 0) {
        setTimeout(() => window.location.reload(), 500);
      } else {
        // Update counter
        const counter = document.querySelector("h2 + p");
        if (counter) {
          counter.textContent = `${updatedJobs.length} job${updatedJobs.length > 1 ? 's' : ''} waiting for confirmation`;
        }
      }
    }, 300);
  }
}

function showStatusMessage(message, type) {
  const statusMsg = document.getElementById("statusMessage");
  if (!statusMsg) return;
  
  statusMsg.style.display = "block";
  statusMsg.textContent = message;
  
  if (type === "success") {
    statusMsg.style.background = "#dcfce7";
    statusMsg.style.color = "#15803d";
    statusMsg.style.border = "1px solid #bbf7d0";
  } else if (type === "error") {
    statusMsg.style.background = "#fee2e2";
    statusMsg.style.color = "#dc2626";
    statusMsg.style.border = "1px solid #fecaca";
  } else {
    statusMsg.style.background = "#f5f5f5";
    statusMsg.style.color = "#525252";
    statusMsg.style.border = "1px solid #e5e5e5";
  }
}

// ===============================
// Auth + Stats helpers
// ===============================

async function checkConnectionStatus(token) {
  const statusEl = document.getElementById("authStatus");
  const countEl = document.getElementById("appCount");

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      statusEl.textContent = "Not logged in";
      statusEl.classList.remove("connected");
      statusEl.classList.add("disconnected");
      countEl.textContent = "-";
      return;
    }

    statusEl.textContent = "Connected";
    statusEl.classList.add("connected");
    statusEl.classList.remove("disconnected");

    // Fetch jobs count
    try {
      const jobsRes = await fetch(`${BACKEND_URL}/api/jobs?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        console.log("[JobTracker] Jobs response:", data);
        
        // Use the total count from pagination metadata
        const jobCount = data.total || 0;
        
        countEl.textContent = jobCount;
        console.log("[JobTracker] Job count:", jobCount);
      } else {
        console.error("[JobTracker] Failed to fetch jobs:", jobsRes.status, await jobsRes.text());
        countEl.textContent = "0";
      }
    } catch (jobError) {
      console.error("[JobTracker] Error fetching jobs:", jobError);
      countEl.textContent = "0";
    }
  } catch (error) {
    console.error("[JobTracker] Connection check failed:", error);
    statusEl.textContent = "Connection error";
    statusEl.classList.remove("connected");
    statusEl.classList.add("disconnected");
    countEl.textContent = "-";
  }
}
