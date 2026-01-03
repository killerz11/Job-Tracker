# Naukri Extension Setup Guide

## ✅ What's Already Done

1. **Created `shared.js`** - Contains reusable functions for both LinkedIn and Naukri
2. **Created `content-naukri.js`** - Template for Naukri-specific tracking
3. **Updated `manifest.json`** - Added Naukri content script and shared.js
4. **Updated `background.js`** - Now accepts platform parameter (linkedin/naukri)
5. **Updated `content.js`** - Uses shared functions for consistency

## 🔧 What You Need To Do

### Step 1: Find Naukri's DOM Selectors

1. Open a Naukri job page in Chrome (e.g., https://www.naukri.com/job-listings-...)
2. Right-click on different elements and select "Inspect"
3. Find the selectors for:

**Job Title:**
- Look for classes like `.jd-header-title`, `.title`, or similar
- Example: `document.querySelector(".jd-header-title")`

**Company Name:**
- Look for classes like `.comp-name`, `.companyInfo`, or similar
- Example: `document.querySelector(".comp-name a")`

**Location:**
- Look for classes like `.loc-wrap`, `.location`, or similar
- Example: `document.querySelector(".loc-wrap")`

**Description:**
- Look for classes like `.dang-inner-html`, `.job-description`, or similar
- Example: `document.querySelector(".dang-inner-html")`

**Apply Button:**
- Look for classes like `.apply-button`, `.btn-apply`, or similar
- Check button text (usually "Apply" or "Apply Now")

### Step 2: Update content-naukri.js

Open `extension/content-naukri.js` and update the selectors in the `extractJobDetails()` function:

```javascript
function extractJobDetails() {
  const jobDetails = {
    jobTitle:
      document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",

    companyName:
      document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",

    location:
      document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",

    description:
      document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim().slice(0, 5000) || "",

    jobUrl: location.href,
    appliedAt: new Date().toISOString(),
  };

  return jobDetails;
}
```

### Step 3: Update Apply Button Detection

In the same file, update the button detection logic:

```javascript
// Update these conditions based on actual Naukri buttons
if (
  text === "apply" ||
  text === "apply now" ||
  classes.includes("YOUR-ACTUAL-BUTTON-CLASS") ||
  id.includes("YOUR-ACTUAL-BUTTON-ID")
) {
  console.log("[JobTracker] ✅ Naukri Apply button detected!");
  handleApplyClick();
  return;
}
```

### Step 4: Test the Extension

1. **Load the extension:**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your `extension` folder

2. **Test on Naukri:**
   - Open a Naukri job page
   - Open DevTools (F12) → Console tab
   - Click any button on the page
   - Look for logs: `[JobTracker] Naukri button clicked:`
   - This will show you the button's text, classes, and id

3. **Verify job extraction:**
   - Click the Apply button
   - Check console for: `[JobTracker] Extracted Naukri job details:`
   - Verify all fields are captured correctly

4. **Test the full flow:**
   - Click Apply on a Naukri job
   - You should see the blue notification
   - Click the extension icon (badge should show ⓵)
   - Confirm or cancel the application

### Step 5: Common Naukri Patterns

Based on typical Naukri structure, try these selectors first:

```javascript
// Job Title
document.querySelector(".jd-header-title")
document.querySelector(".title")

// Company Name  
document.querySelector(".comp-name a")
document.querySelector(".companyInfo a")

// Location
document.querySelector(".loc-wrap")
document.querySelector(".location")

// Description
document.querySelector(".dang-inner-html")
document.querySelector(".job-description")

// Apply Button
button with class "apply-button" or "btn-apply"
button with text "Apply" or "Apply Now"
```

## 🐛 Debugging Tips

1. **Check console logs:**
   - Every button click is logged
   - Job extraction is logged
   - Look for errors or missing data

2. **If job details are empty:**
   - The selectors are wrong
   - Inspect the page and find the correct ones

3. **If apply button not detected:**
   - Check the console for button click logs
   - Update the button detection conditions

4. **Test incrementally:**
   - First, make sure button clicks are detected
   - Then, verify job details extraction
   - Finally, test the full save flow

## 📝 Example Workflow

```
User clicks Apply on Naukri
  ↓
content-naukri.js detects button click
  ↓
Extracts job details from page
  ↓
Caches job in chrome.storage.local
  ↓
Shows blue notification
  ↓
Sets badge on extension icon (⓵)
  ↓
User clicks extension icon
  ↓
popup.js shows pending jobs
  ↓
User confirms "Yes, I applied"
  ↓
popup.js sends to background.js
  ↓
background.js saves to your backend API
  ↓
Success notification shown
```

## 🎯 Next Steps

1. Inspect Naukri's DOM structure
2. Update selectors in `content-naukri.js`
3. Load extension in Chrome
4. Test on a real Naukri job page
5. Iterate until all fields are captured correctly

Good luck! 🚀
