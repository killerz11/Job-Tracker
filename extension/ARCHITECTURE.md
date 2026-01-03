# Extension Architecture

## File Structure

```
extension/
├── manifest.json          # Extension config (updated ✅)
├── background.js          # Service worker (updated ✅)
├── shared.js              # Shared utilities (new ✅)
├── content.js             # LinkedIn tracker (updated ✅)
├── content-naukri.js      # Naukri tracker (new - needs selectors ⚠️)
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
└── icons/                 # Extension icons
```

## How It Works

### LinkedIn Flow
```
LinkedIn Job Page
       ↓
content.js (injected)
       ↓
shared.js (utilities)
       ↓
background.js (service worker)
       ↓
Your Backend API
```

### Naukri Flow (Same Pattern)
```
Naukri Job Page
       ↓
content-naukri.js (injected)
       ↓
shared.js (utilities)
       ↓
background.js (service worker)
       ↓
Your Backend API
```

## Component Responsibilities

### manifest.json
- Defines which scripts run on which sites
- LinkedIn → `content.js` + `shared.js`
- Naukri → `content-naukri.js` + `shared.js`

### shared.js (Reusable)
- `showPageNotification()` - Shows success/error messages
- `showExternalApplyNotification()` - Shows "job saved" notification
- `sendJobToBackground()` - Sends job to background worker
- `cacheExternalApplyJob()` - Saves job to local storage

### content.js (LinkedIn-specific)
- Detects "Easy Apply" and "Apply" buttons
- Extracts job details from LinkedIn DOM
- Handles LinkedIn's multi-step application flow
- Uses shared.js functions

### content-naukri.js (Naukri-specific)
- Detects Naukri apply buttons
- Extracts job details from Naukri DOM
- Handles Naukri's application flow
- Uses shared.js functions
- **⚠️ YOU NEED TO UPDATE SELECTORS HERE**

### background.js (Service Worker)
- Receives job data from content scripts
- Sends data to your backend API
- Shows browser notifications
- Manages extension badge

### popup.js
- Shows pending jobs
- Handles user confirmation
- Manages authentication
- Opens dashboard

## Data Flow

### 1. User Clicks Apply
```javascript
Naukri Page → content-naukri.js detects click
```

### 2. Extract Job Details
```javascript
content-naukri.js → extractJobDetails()
  ↓
Returns: {
  jobTitle: "...",
  companyName: "...",
  location: "...",
  description: "...",
  jobUrl: "...",
  appliedAt: "..."
}
```

### 3. Cache Job
```javascript
content-naukri.js → cacheExternalApplyJob(jobData, "naukri")
  ↓
shared.js → chrome.storage.local.set({ pendingJobs: [...] })
  ↓
Shows blue notification
Sets badge on icon (⓵)
```

### 4. User Confirms
```javascript
User clicks extension icon
  ↓
popup.js → Shows pending jobs
  ↓
User clicks "Yes, I applied"
  ↓
popup.js → chrome.runtime.sendMessage({ type: "JOB_APPLICATION", data: jobData })
```

### 5. Save to Backend
```javascript
background.js → Receives message
  ↓
fetch(`${apiUrl}/api/jobs`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: JSON.stringify({ ...jobData, platform: "naukri" })
})
  ↓
Shows success notification
Clears badge
```

## Key Differences: LinkedIn vs Naukri

| Feature | LinkedIn | Naukri |
|---------|----------|--------|
| Content Script | `content.js` | `content-naukri.js` |
| Apply Flow | Easy Apply (multi-step) | Direct/External |
| DOM Structure | Complex, nested | Different structure |
| Button Detection | "Easy Apply", "Submit" | "Apply", "Apply Now" |
| Platform Tag | `"linkedin"` | `"naukri"` |

## What You Need to Do

1. **Find Naukri's DOM selectors** using `test-helper.js`
2. **Update `content-naukri.js`** with correct selectors
3. **Test** on a real Naukri job page

Everything else is already set up! 🎉

## Debugging

### Check if script is loaded:
```javascript
// In Naukri page console, you should see:
[JobTracker] Naukri content script loaded
```

### Check button clicks:
```javascript
// Click any button, you should see:
[JobTracker] Naukri button clicked: { text: "...", classes: "...", id: "..." }
```

### Check job extraction:
```javascript
// Click Apply, you should see:
[JobTracker] Extracted Naukri job details: { jobTitle: "...", companyName: "..." }
```

## Common Issues

### "Job details are empty"
→ Selectors are wrong, use `test-helper.js` to find correct ones

### "Button not detected"
→ Update button detection conditions in click listener

### "Extension not loading"
→ Check `chrome://extensions/` for errors

### "Backend save fails"
→ Check if logged in, verify backend is running
