# Troubleshooting: "Failed to Fetch" Error

## 🔍 Problem
Extension extracts job details correctly but shows "Failed to fetch" notification and job is not saved.

## 🎯 Most Common Causes (in order of likelihood)

### 1. ⚠️ **Not Logged In Through Extension** (90% of cases)
**Symptoms:**
- Job details extracted successfully
- "Failed to fetch" notification appears
- Console shows: "Auth token not found in extension storage"

**Solution:**
1. Click the JobTracker extension icon (top-right of browser)
2. Enter your email and password in the popup
3. Click "Login" button
4. Wait for "Connected" status
5. Try applying to a job again

**Why this happens:**
The extension stores your auth token separately from the web dashboard. Even if you're logged into the dashboard website, the extension needs its own login.

---

### 2. 🔐 **Expired Session Token**
**Symptoms:**
- Was working before, now suddenly fails
- Console shows: 401 Unauthorized or "Authentication failed"

**Solution:**
1. Click extension icon
2. Login again with your credentials
3. Token will be refreshed

**Why this happens:**
JWT tokens expire after a certain time (usually 7-30 days). You need to re-authenticate.

---

### 3. 🌐 **Backend Server Down or Unreachable**
**Symptoms:**
- Network error in console
- "Failed to connect" or timeout errors
- Extension shows "Connection error"

**Solution:**
1. Check if backend is running: https://humorous-solace-production.up.railway.app/api/health
2. If using local backend, ensure it's running on port 4000
3. Check your internet connection

**How to verify:**
Open this URL in browser: https://humorous-solace-production.up.railway.app/api/health
- Should return: `{"status":"ok"}`
- If error: Backend is down

---

### 4. 🔧 **Extension Context Invalidated**
**Symptoms:**
- Yellow banner at top: "Extension was updated"
- Console shows: "Extension context invalidated"

**Solution:**
1. Reload the LinkedIn page (F5 or Ctrl+R)
2. Try again

**Why this happens:**
Chrome invalidates extension context when extension is updated or reloaded.

---

### 5. 🚫 **CORS Issues** (Rare)
**Symptoms:**
- Console shows: "CORS policy" error
- Network tab shows preflight OPTIONS request failed

**Solution:**
Backend needs to allow extension origin. Check backend CORS configuration:
```javascript
// backend should have:
app.use(cors({
  origin: '*', // or specific origins
  credentials: true
}));
```

---

## 🛠️ Debug Steps

### Step 1: Run Debug Script
1. Open LinkedIn job page
2. Open browser console (F12)
3. Copy and paste this:
```javascript
// Check extension storage
chrome.storage.sync.get(['authToken', 'apiUrl'], (data) => {
  console.log('Auth Token:', data.authToken ? '✅ Present' : '❌ Missing');
  console.log('API URL:', data.apiUrl || 'Using default');
});
```

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to "Network" tab
3. Filter by "Fetch/XHR"
4. Click Easy Apply and submit
5. Look for POST request to `/api/jobs`
6. Check:
   - Status code (should be 200 or 201)
   - Response body (error message if failed)
   - Request headers (Authorization header present?)

### Step 3: Check Console Logs
Look for these messages:
```
✅ Good signs:
- "[JobTracker] Job data cached"
- "[JobTracker] Submit button detected"
- "[JobTracker] Sending linkedin job data to background"
- "[JobTracker] Job saved successfully"

❌ Bad signs:
- "Auth token not found"
- "Failed to save job application"
- "Extension context invalidated"
- "Runtime error"
```

### Step 4: Use Debug Helper
1. Load the debug helper script in console:
```javascript
// Copy content from extension/debug-helper.js
// Or run it directly if you have the file
```

---

## 🔄 Quick Fix Checklist

Try these in order:

1. ✅ **Login through extension popup**
   - Click extension icon → Enter credentials → Login

2. ✅ **Reload the page**
   - Press F5 or Ctrl+R

3. ✅ **Check backend is running**
   - Visit: https://humorous-solace-production.up.railway.app/api/health

4. ✅ **Clear extension storage and re-login**
   ```javascript
   // Run in console:
   chrome.storage.sync.clear();
   chrome.storage.local.clear();
   // Then login again through extension popup
   ```

5. ✅ **Reload extension**
   - Go to: chrome://extensions/
   - Find "JobTracker"
   - Click reload icon 🔄
   - Reload LinkedIn page

6. ✅ **Check browser console for errors**
   - F12 → Console tab
   - Look for red error messages

---

## 📊 Understanding the Flow

### Easy Apply Flow:
```
1. User clicks "Easy Apply" button
   ↓
2. Extension caches job details
   ↓
3. User fills form and clicks "Submit Application"
   ↓
4. Extension detects submit
   ↓
5. Extension sends job data to background.js
   ↓
6. background.js checks for authToken
   ↓ (if missing → ERROR: "Auth token not found")
7. background.js sends POST to backend /api/jobs
   ↓ (if 401 → ERROR: "Authentication failed")
   ↓ (if network error → ERROR: "Failed to fetch")
8. Backend saves job to database
   ↓
9. Success notification shown
```

**Where it fails:**
- **Step 6:** No auth token → Need to login through extension
- **Step 7:** Network error → Backend down or CORS issue
- **Step 7:** 401 error → Token expired, need to re-login
- **Step 8:** 400/500 error → Backend validation or server error

---

## 🧪 Test Cases

### Test 1: Check Extension Login
```javascript
chrome.storage.sync.get(['authToken'], (data) => {
  if (data.authToken) {
    console.log('✅ Logged in');
  } else {
    console.log('❌ Not logged in - Login through extension popup');
  }
});
```

### Test 2: Test Backend Connection
```javascript
fetch('https://humorous-solace-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend online:', d))
  .catch(e => console.log('❌ Backend offline:', e));
```

### Test 3: Test Authentication
```javascript
chrome.storage.sync.get(['authToken'], async (data) => {
  const response = await fetch('https://humorous-solace-production.up.railway.app/api/auth/me', {
    headers: { Authorization: `Bearer ${data.authToken}` }
  });
  if (response.ok) {
    console.log('✅ Auth valid:', await response.json());
  } else {
    console.log('❌ Auth invalid - Login again');
  }
});
```

---

## 💡 Prevention Tips

1. **Always login through extension popup first** before using Easy Apply
2. **Check extension icon** - should show "Connected" status
3. **If you see yellow banner** - reload the page immediately
4. **Re-login periodically** if you haven't used extension in a while
5. **Keep backend URL updated** in extension settings if using custom backend

---

## 🆘 Still Not Working?

If none of the above works, provide these details:

1. **Console logs** (F12 → Console tab)
2. **Network tab** (F12 → Network → Filter: Fetch/XHR)
3. **Extension storage** (Run: `chrome.storage.sync.get(console.log)`)
4. **Backend health check** (Visit: /api/health)
5. **Browser version** (chrome://version)
6. **Extension version** (chrome://extensions → JobTracker)

---

## 🔧 Advanced Debugging

### Enable Verbose Logging
Add this to content-linkedin.js (line 1):
```javascript
localStorage.setItem('jobtracker-debug', 'true');
```

### Check Background Service Worker
1. Go to: chrome://extensions/
2. Find "JobTracker"
3. Click "service worker" link
4. Check console for errors

### Inspect Extension Storage
```javascript
// Check sync storage
chrome.storage.sync.get(null, (data) => {
  console.log('Sync Storage:', data);
});

// Check local storage
chrome.storage.local.get(null, (data) => {
  console.log('Local Storage:', data);
});
```

### Manual Job Save Test
```javascript
chrome.runtime.sendMessage({
  type: "JOB_APPLICATION",
  data: {
    companyName: "Test Company",
    jobTitle: "Test Job",
    location: "Test Location",
    description: "Test",
    jobUrl: window.location.href,
    platform: "linkedin",
    appliedAt: new Date().toISOString()
  }
}, (response) => {
  console.log('Response:', response);
});
```
