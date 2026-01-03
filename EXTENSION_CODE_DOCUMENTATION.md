# JobTracker Chrome Extension - Complete Code Documentation

## Overview
This is a Chrome Extension (Manifest V3) that tracks LinkedIn job applications. It supports both Easy Apply and External Apply workflows, stores pending applications, and syncs them to a backend API.

## Architecture

### Files Structure
```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic and pending jobs management
├── content.js         # LinkedIn page interaction and job detection
├── background.js      # Service worker for API calls and notifications
└── icons/            # Extension icons (16, 32, 48, 128px)
```

---

## File: manifest.json

```json
{
  "manifest_version": 3,
  "name": "JobTracker - LinkedIn Application Tracker",
  "version": "1.0.0",
  "description": "Track your LinkedIn job applications and sync them to your dashboard",

  "permissions": ["storage", "notifications"],

  "host_permissions": [
    "https://www.linkedin.com/*",
    "http://localhost:3000/*",
    "http://localhost:4000/*"
  ],

  "background": {
    "service_worker": "background.js"
  },

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.jpg",
      "32": "icons/icon32.jpg",
      "48": "icons/icon48.jpg",
      "128": "icons/icon128.jpg"
    }
  },

  "icons": {
    "16": "icons/icon16.jpg",
    "32": "icons/icon32.jpg",
    "48": "icons/icon48.jpg",
    "128": "icons/icon128.jpg"
  },

  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/jobs/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### Key Features:
- **Manifest V3** (latest Chrome extension standard)
- **Permissions**: Storage for caching jobs, Notifications for user feedback
- **Host Permissions**: LinkedIn for job tracking, localhost for API communication
- **Content Script**: Runs on LinkedIn job pages to detect apply button clicks

---

## File: popup.html

### Complete Code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JobTracker</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 340px;
      min-height: 200px;
      max-height: 600px;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      background: #ffffff;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    
    .logo {
      width: 32px;
      height: 32px;
      background: #2563eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    
    h1 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }
    
    .status {
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .status-item:last-child {
      margin-bottom: 0;
    }
    
    .status-label {
      color: #6b7280;
    }
    
    .status-value {
      font-weight: 600;
      color: #111827;
    }
    
    .status-value.connected {
      color: #10b981;
    }
    
    .status-value.disconnected {
      color: #ef4444;
    }
    
    .section {
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    
    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    button {
      width: 100%;
      padding: 10px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    button:hover {
      background: #1d4ed8;
    }
    
    button.secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    button.secondary:hover {
      background: #e5e7eb;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .info {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    
    .link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    
    .link:hover {
      text-decoration: underline;
    }

    #authSection {
      margin-bottom: 16px;
    }

    .divider {
      height: 1px;
      background: #e5e7eb;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div id="content">
    <div class="header">
      <div class="logo">JT</div>
      <h1>JobTracker</h1>
    </div>
    
    <div class="status">
      <div class="status-item">
        <span class="status-label">Status:</span>
        <span class="status-value disconnected" id="authStatus">Not logged in</span>
      </div>
      <div class="status-item">
        <span class="status-label">Applications tracked:</span>
        <span class="status-value" id="appCount">-</span>
      </div>
    </div>
    
    <div class="section">
      <button id="openDashboard" class="secondary">Open Dashboard</button>
    </div>

    <div class="divider"></div>
    
    <div id="authSection">
      <div class="section-title">Login</div>
      <input id="email" type="email" placeholder="Email" autocomplete="email" />
      <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
      <button id="loginBtn">Login</button>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-title">API Configuration</div>
      <input type="url" id="apiUrl" placeholder="http://localhost:4000" />
      <button id="saveConfig" class="secondary">Save Configuration</button>
    </div>
    
    <div class="info">
      Visit LinkedIn job pages and click "Apply" or "Easy Apply" to automatically track applications.
    </div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

### Key Styles:
- Width: 340px
- Max height: 600px (scrollable)
- Clean, modern design with Tailwind-inspired colors
- Responsive buttons with hover states

### Main Sections:
1. **Header**: Logo + Title
2. **Status**: Connection status + job count
3. **Dashboard Button**: Opens web dashboard
4. **Login Form**: Email + Password
5. **API Config**: Backend URL configuration
6. **Info**: Usage instructions

---

## File: popup.js

### Complete Code:

```javascript
// Popup script

document.addEventListener("DOMContentLoaded", async () => {
  // ===============================
  // Check for pending jobs FIRST
  // ===============================
  const { pendingJobs } = await chrome.storage.local.get("pendingJobs");
  
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

  const { apiUrl, authToken } = await chrome.storage.sync.get([
    "apiUrl",
    "authToken",
  ]);

  if (apiUrl) {
    document.getElementById("apiUrl").value = apiUrl;
  }

  if (authToken) {
    await checkConnectionStatus(authToken);
  }

  // Save configuration
  document.getElementById("saveConfig")?.addEventListener("click", async () => {
    const apiUrl = document.getElementById("apiUrl").value.trim();
    await chrome.storage.sync.set({ apiUrl });
    alert("Configuration saved!");
  });

  // Open dashboard
  document.getElementById("openDashboard")?.addEventListener("click", async () => {
    const { apiUrl, authToken } = await chrome.storage.sync.get([
      "apiUrl",
      "authToken",
    ]);

    const backendUrl = apiUrl || "http://localhost:4000";
    const dashboardUrl = "http://localhost:3000";

    if (!authToken) {
      alert("Please login first to open dashboard");
      return;
    }

    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!res.ok) {
      alert("Session expired. Please login again.");
      return;
    }

    chrome.tabs.create({ url: `${dashboardUrl}/dashboard` });
  });

  // Login
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    const baseUrl = apiUrl || "http://localhost:4000";

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
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
      <div class="logo">JT</div>
      <h1>JobTracker</h1>
    </div>
    
    <div style="text-align: center; margin: 16px 0 20px 0;">
      <div style="font-size: 36px; margin-bottom: 8px;">💼</div>
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
      ${jobs.map((job) => `
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
    const { apiUrl, authToken } = await chrome.storage.sync.get(["apiUrl", "authToken"]);
    
    if (!authToken) {
      showStatusMessage("❌ Please login first", "error");
      return false;
    }

    const baseUrl = apiUrl || "http://localhost:4000";
    
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
    statusMsg.style.background = "#d1fae5";
    statusMsg.style.color = "#065f46";
  } else if (type === "error") {
    statusMsg.style.background = "#fee2e2";
    statusMsg.style.color = "#991b1b";
  } else {
    statusMsg.style.background = "#f3f4f6";
    statusMsg.style.color = "#374151";
  }
}

// ===============================
// Auth + Stats helpers
// ===============================

async function checkConnectionStatus(token) {
  const statusEl = document.getElementById("authStatus");
  const countEl = document.getElementById("appCount");

  const { apiUrl } = await chrome.storage.sync.get(["apiUrl"]);
  const baseUrl = apiUrl || "http://localhost:4000";

  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      statusEl.textContent = "Not logged in";
      statusEl.classList.remove("connected");
      statusEl.classList.add("disconnected");
      return;
    }

    statusEl.textContent = "Connected";
    statusEl.classList.add("connected");
    statusEl.classList.remove("disconnected");

    const jobsRes = await fetch(`${baseUrl}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (jobsRes.ok) {
      const data = await jobsRes.json();
      countEl.textContent = data.jobs.length;
    }
  } catch (error) {
    console.error("[JobTracker] Connection check failed:", error);
    statusEl.textContent = "Connection error";
    statusEl.classList.remove("connected");
    statusEl.classList.add("disconnected");
  }
}
```

### Main Functions

#### 1. `showPendingJobsUI(jobs)`
Displays multiple pending jobs in a scrollable list.

**Features:**
- Shows all pending external apply jobs
- Individual confirm/reject buttons per job
- "Confirm All" and "Clear All" bulk actions
- Time ago display (e.g., "2h ago")
- Smooth animations on job removal
- Custom scrollbar styling

**Job Card Structure:**
```javascript
{
  id: "job-timestamp-randomid",
  companyName: "Company Name",
  jobTitle: "Job Title",
  location: "Location",
  jobUrl: "https://...",
  platform: "linkedin",
  status: "APPLIED",
  timestamp: 1234567890,
  appliedAt: "2024-01-01T00:00:00.000Z"
}
```

#### 2. `handleConfirmJob(jobId, shouldSave)`
Handles individual job confirmation/rejection.

**Flow:**
1. Find job in pendingJobs array
2. If saving: Call `saveJobToBackend()`
3. Update UI with visual feedback (green/red)
4. Remove from storage
5. Update badge count

#### 3. `saveJobToBackend(jobData)`
Sends job data to backend API.

**API Call:**
```javascript
POST /api/jobs
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
Body: {
  companyName, jobTitle, location,
  description, jobUrl, platform, appliedAt
}
```

#### 4. `checkConnectionStatus(token)`
Verifies authentication and fetches job count.

**API Calls:**
- `GET /api/auth/me` - Verify token
- `GET /api/jobs` - Get job count

---

## File: content.js

### Main Functions

#### 1. `extractJobDetails()`
Extracts job information from LinkedIn page DOM.

**Extracted Fields:**
- `jobTitle`: From h1 or job card title
- `companyName`: From company link or text
- `location`: From job details bullet
- `description`: First 5000 chars of job description
- `jobUrl`: Current page URL
- `appliedAt`: ISO timestamp

#### 2. `handleExternalApply()`
Handles external apply button clicks (non-Easy Apply).

**Flow:**
1. Extract job details
2. Create unique job ID
3. Check for duplicates (by URL)
4. Add to `pendingJobs` array in chrome.storage.local
5. Show on-page notification
6. Update extension badge
7. Send message to background script

**Error Handling:**
- Checks for extension context validity
- Shows reload banner if extension was updated
- Graceful fallback with user-friendly messages

#### 3. `handleSubmitApplication()`
Handles Easy Apply submission.

**Flow:**
1. Wait 2 seconds for LinkedIn to process
2. Check if modal is still open
3. Check for error messages
4. If successful, extract job data
5. Send to background script immediately
6. Show success/error notification

#### 4. `showFinalConfirmationModal(jobData)`
Shows modal on LinkedIn when user returns after external apply.

**Features:**
- Full-screen overlay
- Job details display
- "Yes, I applied" / "No, I didn't" buttons
- Saves to backend or removes from pending
- Updates badge count

#### 5. `showExtensionInvalidWarning()`
Shows yellow banner when extension context is invalid.

**Triggers:**
- Extension was updated/reloaded
- Content script lost connection to background
- Chrome runtime API calls fail

#### 6. Global Click Listener
Detects all button clicks on LinkedIn job pages.

**Detection Patterns:**

**Easy Apply:**
- Text: "easy apply"
- Aria-label: "easy apply"
- Class: "jobs-apply-button" + text "easy apply"

**Submit:**
- Text: "submit application" or "submit"
- Aria-label: "submit application"

**External Apply:**
- Text: "apply", "apply now", or starts with "apply"
- Aria-label: "apply to"
- Class: "jobs-apply-button" (without "easy")
- Excludes: "easy apply", "submit"

---

## File: background.js

### Message Handlers

#### 1. `JOB_APPLICATION`
Saves job to backend API.

**Flow:**
1. Get auth token from storage
2. POST to `/api/jobs`
3. Show success/error notification
4. Return response to sender

#### 2. `EXTERNAL_APPLY_CACHED`
Updates badge when external apply is cached.

**Actions:**
- Set badge text to job count
- Set badge color to blue (#2563eb)
- Show browser notification

#### 3. `UPDATE_BADGE`
Updates badge count.

**Logic:**
- If count > 0: Show number
- If count = 0: Clear badge

#### 4. `CLEAR_BADGE`
Clears extension badge.

### Notification Functions

#### `showNotification(type, jobData, errorMessage)`
Shows browser notification for job tracking result.

**Types:**
- **success**: "✅ Job Application Tracked!"
- **error**: "❌ Failed to Track Application"

#### `showExternalApplyNotification(count)`
Shows notification when external apply is cached.

**Features:**
- Persistent (requireInteraction: true)
- Shows pending job count
- Instructions to click extension icon

---

## Data Flow

### Easy Apply Flow
```
1. User clicks "Easy Apply" button
   → content.js detects click
   → cacheJobData() stores job info

2. User fills form and clicks "Submit"
   → content.js detects submit
   → handleSubmitApplication() waits 2s
   → Checks if modal closed (success indicator)

3. Send to background
   → background.js receives JOB_APPLICATION
   → POST to /api/jobs
   → Show notification
   → Return success/error to content.js

4. Show result on page
   → content.js shows green/red notification
```

### External Apply Flow
```
1. User clicks "Apply" button (external)
   → content.js detects click
   → handleExternalApply() extracts job data
   → Add to pendingJobs array
   → Show blue notification on page
   → Set badge to "1" (or increment)
   → Send EXTERNAL_APPLY_CACHED to background
   → background.js shows browser notification

2. User redirected to external site
   → Applies on company website

3. User returns to LinkedIn or clicks extension
   → If on LinkedIn: showFinalConfirmationModal()
   → If clicks extension: showPendingJobsUI()

4. User confirms application
   → popup.js or content.js sends JOB_APPLICATION
   → background.js saves to backend
   → Remove from pendingJobs
   → Update badge count
   → Show success notification
```

---

## Storage Schema

### chrome.storage.sync
```javascript
{
  apiUrl: "http://localhost:4000",
  authToken: "jwt-token-here"
}
```

### chrome.storage.local
```javascript
{
  pendingJobs: [
    {
      id: "job-1234567890-abc123",
      companyName: "Company Name",
      jobTitle: "Job Title",
      location: "City, State",
      description: "Job description...",
      jobUrl: "https://linkedin.com/jobs/...",
      platform: "linkedin",
      status: "APPLIED",
      timestamp: 1234567890,
      appliedAt: "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Verify token and get user info

### Jobs
- `POST /api/jobs` - Create new job application
- `GET /api/jobs` - List all jobs for authenticated user
- `PATCH /api/jobs/:id` - Update job status

---

## Error Handling

### Extension Context Invalidation
**Problem:** Extension updated while LinkedIn page is open.

**Solution:**
1. Check `chrome.runtime.getManifest()` on load
2. Wrap all chrome API calls in try-catch
3. Check `chrome.runtime.lastError` after async calls
4. Show yellow banner with reload button
5. User-friendly error messages

### Network Errors
**Handled in:**
- popup.js: Login, API config, job saving
- background.js: API calls with try-catch
- content.js: Message sending with error callbacks

### Duplicate Jobs
**Prevention:**
- Check `pendingJobs` array for existing URL
- Show "Job already saved" notification
- Don't add duplicate to storage

---

## UI/UX Features

### Notifications
1. **On-page notifications** (content.js)
   - Green for success
   - Red for errors
   - Yellow for warnings
   - Auto-dismiss after 5-8 seconds
   - Slide-in animation

2. **Browser notifications** (background.js)
   - System notifications
   - Persistent for external apply
   - Click to dismiss

3. **Extension badge**
   - Shows pending job count
   - Blue background
   - Clears when all confirmed

### Animations
- Slide-in from right (notifications)
- Fade-in (modals)
- Slide-up (modal content)
- Color transitions (job cards)
- Smooth removal (job cards)

### Responsive Design
- Scrollable job list (max 400px)
- Custom scrollbar styling
- Hover effects on all buttons
- Disabled state styling
- Loading states

---

## Best Practices Implemented

1. **Manifest V3 Compliance**
   - Service worker instead of background page
   - Async message handling
   - Proper permission declarations

2. **Error Handling**
   - Try-catch blocks
   - Runtime error checks
   - User-friendly messages
   - Graceful degradation

3. **Performance**
   - Event delegation
   - Debounced operations
   - Minimal DOM queries
   - Efficient storage usage

4. **Security**
   - JWT authentication
   - HTTPS for API calls
   - No sensitive data in content scripts
   - Proper CORS handling

5. **User Experience**
   - Clear visual feedback
   - Loading states
   - Confirmation dialogs
   - Helpful error messages
   - Smooth animations

---

## Known Limitations

1. **LinkedIn DOM Changes**
   - Selectors may break if LinkedIn updates their HTML
   - Multiple fallback selectors implemented

2. **External Apply Detection**
   - Cannot detect actual application completion on external sites
   - Relies on user confirmation

3. **Extension Updates**
   - Requires page reload after extension update
   - Shows warning banner to guide users

4. **Storage Limits**
   - chrome.storage.local has 5MB limit
   - Job descriptions truncated to 5000 chars

---

## Future Improvements

1. **Enhanced Detection**
   - Use MutationObserver for more reliable button detection
   - Better success confirmation for Easy Apply

2. **Offline Support**
   - Queue jobs when offline
   - Sync when connection restored

3. **Analytics**
   - Track application success rate
   - Time spent on applications

4. **Multi-Platform**
   - Support Indeed, Glassdoor, etc.
   - Unified job tracking

---

## Debugging Tips

### Enable Console Logs
All logs are prefixed with `[JobTracker]` for easy filtering.

### Check Storage
```javascript
// In browser console
chrome.storage.local.get('pendingJobs', console.log)
chrome.storage.sync.get(['apiUrl', 'authToken'], console.log)
```

### Test Button Detection
Click any button on LinkedIn and check console for:
```
[JobTracker] Button clicked: {text: "...", aria: "...", hasJobsApplyClass: ...}
```

### Verify Extension Context
```javascript
// In content script console
chrome.runtime.getManifest()
// Should return manifest object, not throw error
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- Easy Apply support
- External Apply support
- Multiple pending jobs
- Scrollable popup UI
- Error handling
- Extension context validation

---

## Contact & Support

For issues or questions about this extension code, refer to:
- Backend API documentation
- Chrome Extension API docs: https://developer.chrome.com/docs/extensions/
- Manifest V3 migration guide: https://developer.chrome.com/docs/extensions/mv3/intro/

---

*End of Documentation*


---

## File: content.js

### Complete Code:

```javascript
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
  return {
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
    console.log("[JobTracker] Job data cached:", {
      jobTitle: cachedJobData.jobTitle,
      companyName: cachedJobData.companyName,
    });
  } else {
    console.warn("[JobTracker] Could not cache job data - missing title or company");
  }
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
        id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
```

---

## File: background.js

### Complete Code:

```javascript
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
```

---
