// =====================================
// JobTracker Debug Helper
// Run this in browser console on LinkedIn
// =====================================

async function debugJobTracker() {
  console.log("=== JobTracker Debug Info ===\n");
  
  // 1. Check extension storage
  console.log("1. Checking Extension Storage...");
  const storage = await chrome.storage.sync.get(["authToken", "apiUrl"]);
  console.log("   Auth Token:", storage.authToken ? "✅ Present" : "❌ Missing");
  console.log("   API URL:", storage.apiUrl || "Using default");
  
  if (!storage.authToken) {
    console.error("   ⚠️ NO AUTH TOKEN! Please login through extension popup first.");
    return;
  }
  
  // 2. Test backend connection
  console.log("\n2. Testing Backend Connection...");
  const baseUrl = storage.apiUrl || "https://humorous-solace-production.up.railway.app";
  console.log("   Backend URL:", baseUrl);
  
  try {
    const authResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storage.authToken}` }
    });
    
    console.log("   Auth Check Status:", authResponse.status);
    
    if (authResponse.ok) {
      const userData = await authResponse.json();
      console.log("   ✅ Authentication Valid");
      console.log("   User:", userData);
    } else {
      console.error("   ❌ Authentication Failed");
      const errorData = await authResponse.json().catch(() => ({}));
      console.error("   Error:", errorData);
      console.error("   ⚠️ Your token might be expired. Please login again through extension popup.");
      return;
    }
  } catch (error) {
    console.error("   ❌ Connection Failed:", error.message);
    console.error("   ⚠️ Backend might be down or unreachable.");
    return;
  }
  
  // 3. Test job creation
  console.log("\n3. Testing Job Creation...");
  const testJob = {
    companyName: "Test Company",
    jobTitle: "Test Position",
    location: "Test Location",
    description: "Test job for debugging",
    jobUrl: window.location.href,
    platform: "linkedin",
    appliedAt: new Date().toISOString()
  };
  
  try {
    const jobResponse = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${storage.authToken}`
      },
      body: JSON.stringify(testJob)
    });
    
    console.log("   Job Creation Status:", jobResponse.status);
    
    if (jobResponse.ok) {
      const jobData = await jobResponse.json();
      console.log("   ✅ Job Creation Successful");
      console.log("   Created Job:", jobData);
    } else {
      console.error("   ❌ Job Creation Failed");
      const errorData = await jobResponse.json().catch(() => ({}));
      console.error("   Error:", errorData);
    }
  } catch (error) {
    console.error("   ❌ Request Failed:", error.message);
  }
  
  // 4. Check pending jobs
  console.log("\n4. Checking Pending Jobs...");
  const local = await chrome.storage.local.get("pendingJobs");
  console.log("   Pending Jobs:", local.pendingJobs?.length || 0);
  if (local.pendingJobs?.length > 0) {
    console.log("   Jobs:", local.pendingJobs);
  }
  
  console.log("\n=== Debug Complete ===");
}

// Run the debug
debugJobTracker();
