# Production Login Debugging Guide

## Issue: Common login works on localhost but not on Vercel production

### Quick Checks

#### 1. Verify Vercel Deployment
- Go to https://vercel.com/dashboard
- Check if the latest deployment is complete
- Look for commit: "chore: trigger Vercel production deployment for common login"
- Status should be "Ready" (not "Building" or "Failed")

#### 2. Check Extension Mode
Open extension popup and check console:
```javascript
// In extension popup console
chrome.storage.sync.get(['devMode', 'apiUrl', 'dashboardUrl'], (data) => {
  console.log('Extension Config:', data);
  console.log('Dev Mode:', data.devMode ? 'ENABLED' : 'DISABLED');
  console.log('Backend URL:', data.apiUrl || 'Using default production');
  console.log('Dashboard URL:', data.dashboardUrl || 'Using default production');
});
```

**Expected output for production:**
```
Extension Config: {}
Dev Mode: DISABLED
Backend URL: Using default production
Dashboard URL: Using default production
```

If `devMode: true`, disable it:
```javascript
chrome.storage.sync.set({ devMode: false });
```

#### 3. Verify Extension ID
```javascript
// In extension popup console
console.log('Extension ID:', chrome.runtime.id);
```

Copy this ID and verify it matches what the website is using.

#### 4. Test Production Login Flow

1. Open extension popup
2. Click "Open Dashboard / Login"
3. Check the URL - should be:
   ```
   https://job-tracker-gules-eta.vercel.app/login?ext=YOUR_EXTENSION_ID
   ```

4. Open browser console (F12) on the login page
5. Login with your credentials
6. Check console for errors

**Expected console output:**
```javascript
// Should see:
chrome.runtime.sendMessage(extensionId, { type: 'AUTH_TOKEN', token: '...' })
// Response: { success: true }
```

**Common errors:**

**Error 1: "Could not establish connection"**
```
Cause: Extension ID mismatch or externally_connectable not configured
Fix: Verify extension ID and manifest.json externally_connectable
```

**Error 2: "chrome is not defined"**
```
Cause: Vercel hasn't deployed the latest code
Fix: Wait for deployment to complete, then hard refresh (Ctrl+Shift+R)
```

**Error 3: "Extension context invalidated"**
```
Cause: Extension was reloaded while page was open
Fix: Refresh the login page
```

#### 5. Verify Manifest Configuration

Check `extension/manifest.json`:
```json
"externally_connectable": {
  "matches": [
    "https://job-tracker-gules-eta.vercel.app/*",
    "http://localhost:3000/*"
  ]
}
```

**Important:** The URL must match EXACTLY (including https://)

#### 6. Hard Refresh Production Site

Sometimes browsers cache old JavaScript:
1. Go to https://job-tracker-gules-eta.vercel.app/login
2. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. This forces a hard refresh, bypassing cache

#### 7. Check Network Tab

1. Open DevTools (F12) on the login page
2. Go to Network tab
3. Login
4. Look for the login API call to Railway backend
5. Check if it returns a token

### Manual Test Script

Run this in the production login page console after logging in:

```javascript
// Get extension ID from URL
const urlParams = new URLSearchParams(window.location.search);
const extensionId = urlParams.get('ext');

console.log('Extension ID from URL:', extensionId);

// Test sending message to extension
if (extensionId) {
  chrome.runtime.sendMessage(
    extensionId,
    { type: 'AUTH_TOKEN', token: 'test-token-123' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Error:', chrome.runtime.lastError.message);
      } else {
        console.log('✅ Success:', response);
      }
    }
  );
} else {
  console.error('❌ No extension ID in URL');
}
```

### Solution Checklist

- [ ] Vercel deployment is complete and shows "Ready"
- [ ] Extension is NOT in dev mode (`devMode: false`)
- [ ] Extension ID matches between popup and login URL
- [ ] Production URL in manifest matches actual Vercel URL
- [ ] Hard refreshed the production login page (Ctrl+Shift+R)
- [ ] Browser console shows no errors
- [ ] Login API call returns a token
- [ ] `chrome.runtime.sendMessage` executes without errors

### Still Not Working?

If all checks pass but it still doesn't work:

1. **Rebuild the extension:**
   ```bash
   cd extension
   npm run build
   ```

2. **Reload the extension:**
   - Go to `chrome://extensions`
   - Click "Reload" on JobTracker extension

3. **Clear extension storage:**
   ```javascript
   // In extension popup console
   chrome.storage.sync.clear();
   chrome.storage.local.clear();
   ```

4. **Test with a fresh browser profile:**
   - Create a new Chrome profile
   - Install the extension
   - Test the login flow

### Get Extension Logs

To see what's happening in the background:

```javascript
// In extension background service worker console
// (chrome://extensions -> JobTracker -> "service worker")
console.log('Background script loaded');
```

Check for any errors related to message handling.
