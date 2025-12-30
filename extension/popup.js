// Popup script

document.addEventListener("DOMContentLoaded", async () => {
  // Load saved configuration
  const { apiUrl, authToken } = await chrome.storage.sync.get([
    "apiUrl",
    "authToken",
  ]);
  if (apiUrl) {
    document.getElementById("apiUrl").value = apiUrl
  }

  if (authToken) {
    await checkConnectionStatus(authToken);
  }

  // Save configuration
  document.getElementById("saveConfig").addEventListener("click", async () => {
    const apiUrl = document.getElementById("apiUrl").value.trim();
    await window.chrome.storage.sync.set({ apiUrl })
    alert("Configuration saved!")
  })

  // Open dashboard
  document
  .getElementById("openDashboard")
  .addEventListener("click", async () => {
    const { apiUrl, authToken } = await window.chrome.storage.sync.get([
      "apiUrl",
      "authToken",
    ]);

    const baseUrl = apiUrl || "http://localhost:4000";

    if (!authToken) {
      alert("Please login first to open dashboard");
      return;
    }

    // Optional: verify token before opening
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      alert("Session expired. Please login again.");
      return;
    }

    window.chrome.tabs.create({
      url: `${baseUrl}/dashboard`,
    });
  });

  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const baseUrl = apiUrl || "http://localhost:4000";

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert("Login failed");
      return;
    }

    const { token } = await res.json();
    await chrome.storage.sync.set({ authToken: token });
    await checkConnectionStatus(token);
  });
});

async function checkConnectionStatus(token) {
  const statusEl = document.getElementById("authStatus");
  const countEl = document.getElementById("appCount");

  const { apiUrl } = await chrome.storage.sync.get(["apiUrl"]);
  const baseUrl = apiUrl || "http://localhost:4000";

  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (jobsRes.ok) {
    const data = await jobsRes.json();
    countEl.textContent = data.jobs.length;
    
    // Show last sync time
    const lastSyncEl = document.getElementById("lastSync");
    const lastSyncItem = document.getElementById("lastSyncItem");
    if (lastSyncEl && lastSyncItem) {
      lastSyncItem.style.display = "flex";
      lastSyncEl.textContent = new Date().toLocaleTimeString();
    }
    
    // Show recent jobs (last 3)
    const recentActivity = document.getElementById("recentActivity");
    const recentJobsList = document.getElementById("recentJobsList");
    if (data.jobs.length > 0 && recentActivity && recentJobsList) {
      recentActivity.style.display = "block";
      const recentJobs = data.jobs.slice(0, 3);
      recentJobsList.innerHTML = recentJobs.map(job => `
        <div style="padding: 8px; background: #f9fafb; border-radius: 6px; margin-bottom: 6px;">
          <div style="font-weight: 600; color: #111827; font-size: 13px;">${job.jobTitle}</div>
          <div style="color: #6b7280; font-size: 12px;">${job.companyName}</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
            ${new Date(job.appliedAt).toLocaleDateString()}
          </div>
        </div>
      `).join('');
    }
  }
}

// Listen for messages from content script to refresh popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "JOB_SAVED") {
    chrome.storage.sync.get(["authToken"], async (result) => {
      if (result.authToken) {
        await checkConnectionStatus(result.authToken);
      }
    });
  }
});
