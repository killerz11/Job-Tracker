// Popup script

document.addEventListener("DOMContentLoaded", async () => {
  // Load saved configuration
  const { apiUrl } = await window.chrome.storage.sync.get(["apiUrl"])
  if (apiUrl) {
    document.getElementById("apiUrl").value = apiUrl
  }

  // Check connection status
  checkConnectionStatus()

  // Save configuration
  document.getElementById("saveConfig").addEventListener("click", async () => {
    const apiUrl = document.getElementById("apiUrl").value.trim()

    if (!apiUrl) {
      alert("Please enter an API URL")
      return
    }

    await window.chrome.storage.sync.set({ apiUrl })
    alert("Configuration saved!")
    checkConnectionStatus()
  })

  // Open dashboard
  document.getElementById("openDashboard").addEventListener("click", async () => {
    const { apiUrl } = await window.chrome.storage.sync.get(["apiUrl"])
    const dashboardUrl = apiUrl ? `${apiUrl}/dashboard` : "http://localhost:3000/dashboard"
    window.chrome.tabs.create({ url: dashboardUrl })
  })

  // Help link
  document.getElementById("helpLink").addEventListener("click", (e) => {
    e.preventDefault()
    alert(
      "JobTracker Extension Help:\n\n1. Configure your API URL\n2. Sign in to your account\n3. Visit LinkedIn job pages\n4. Click Apply/Easy Apply buttons\n5. Extension will auto-track applications",
    )
  })
})

async function checkConnectionStatus() {
  const statusEl = document.getElementById("connectionStatus")
  const countEl = document.getElementById("appCount")

  try {
    const { apiUrl } = await window.chrome.storage.sync.get(["apiUrl"])
    const baseUrl = apiUrl || "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      credentials: "include",
    })

    if (response.ok) {
      statusEl.textContent = "Connected"
      statusEl.className = "status-value connected"

      // Try to get application count
      const jobsResponse = await fetch(`${baseUrl}/api/jobs`, {
        credentials: "include",
      })

      if (jobsResponse.ok) {
        const data = await jobsResponse.json()
        countEl.textContent = data.jobs?.length || 0
      }
    } else {
      statusEl.textContent = "Not logged in"
      statusEl.className = "status-value disconnected"
      countEl.textContent = "-"
    }
  } catch (error) {
    console.error("Connection check failed:", error)
    statusEl.textContent = "Disconnected"
    statusEl.className = "status-value disconnected"
    countEl.textContent = "-"
  }
}
