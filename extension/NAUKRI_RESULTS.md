# ✅ Naukri Selectors Found & Applied

## Test Results from Naukri Page

### What We Found:

✅ **Job Title:** `h1` or `[class*="title"]`
- Example: "CLOUD ENGINEER"

⚠️ **Company Name:** Not found in standard selectors
- Need to extract from page context
- Added fallback logic to search for company-related elements

⚠️ **Location:** Not found in standard selectors  
- Need to extract from page context
- Added fallback logic to search for location-related elements

✅ **Description:** `[class*="jd-"]`
- Found successfully

✅ **Apply Button:** 
- Text: "apply on company site"
- Class: `styles_company-site-button__C_2YK company-site-button`
- ID: `company-site-button`

## ✅ Updates Applied to content-naukri.js

### 1. Job Title Extraction
```javascript
jobTitle:
  document.querySelector("h1")?.innerText.trim() ||
  document.querySelector('[class*="title"]')?.innerText.trim() ||
  ""
```

### 2. Company Name Extraction (with fallback)
```javascript
companyName:
  document.querySelector(".comp-name a")?.innerText.trim() ||
  document.querySelector(".companyInfo a")?.innerText.trim() ||
  document.querySelector('[class*="company"]')?.innerText.trim() ||
  // Fallback: search for company-related elements
  Array.from(document.querySelectorAll('a, span, div'))
    .find(el => el.innerText && el.innerText.length > 2 && el.innerText.length < 100 && 
                (el.className.includes('company') || el.className.includes('comp')))
    ?.innerText.trim() ||
  ""
```

### 3. Location Extraction (with fallback)
```javascript
location:
  document.querySelector(".loc-wrap")?.innerText.trim() ||
  document.querySelector(".location")?.innerText.trim() ||
  document.querySelector('[class*="location"]')?.innerText.trim() ||
  // Fallback: search for location-related elements
  Array.from(document.querySelectorAll('span, div'))
    .find(el => el.innerText && el.innerText.length > 2 && el.innerText.length < 100 && 
                (el.className.includes('location') || el.className.includes('loc')))
    ?.innerText.trim() ||
  ""
```

### 4. Description Extraction
```javascript
description:
  document.querySelector('[class*="jd-"]')?.innerText.trim().slice(0, 5000) ||
  document.querySelector(".dang-inner-html")?.innerText.trim().slice(0, 5000) ||
  document.querySelector(".job-description")?.innerText.trim().slice(0, 5000) ||
  ""
```

### 5. Apply Button Detection
```javascript
if (
  text.includes("apply") ||
  text === "apply on company site" ||
  classes.includes("apply-button") ||
  classes.includes("company-site-button") ||
  id.includes("apply") ||
  id === "company-site-button"
) {
  handleApplyClick();
}
```

## 🚀 Next Steps

### 1. Load the Extension
```bash
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension folder
```

### 2. Test on Naukri
```bash
1. Go to the same Naukri job page
2. Press F12 → Console
3. Click "Apply on company site" button
4. Check console for:
   - [JobTracker] Naukri content script loaded
   - [JobTracker] Naukri apply button detected!
   - [JobTracker] Extracted Naukri job details
```

### 3. Verify Job Details
When you click Apply, check the console output for:
```javascript
[JobTracker] Extracted Naukri job details: {
  jobTitle: "CLOUD ENGINEER",
  companyName: "...",  // Check if this is captured
  location: "...",     // Check if this is captured
  hasDescription: true,
  jobUrl: "https://www.naukri.com/..."
}
```

### 4. If Company/Location Are Empty

The test showed these fields weren't found with standard selectors. You have two options:

**Option A: Inspect the page manually**
1. Right-click on the company name → Inspect
2. Find its class/id
3. Update the selector in `content-naukri.js`

**Option B: Use the fallback logic**
The code now searches for elements with "company" or "location" in their class names. This might work automatically.

### 5. Test Full Flow
```bash
1. Click "Apply on company site" on Naukri
2. Blue notification should appear
3. Extension icon should show badge (⓵)
4. Click extension icon
5. Confirm the job
6. Verify it saves to your backend
```

## ⚠️ Known Issues

### Company Name & Location Not Found
The test script didn't find these with standard selectors. This could mean:
- Naukri loads them dynamically (after page load)
- They're in a different format on this specific job page
- They use obfuscated class names

**Solution:** When you test the extension, check the console output. If these fields are empty, you'll need to:
1. Inspect the actual elements on the page
2. Find their exact selectors
3. Update `content-naukri.js` with the correct selectors

## 🎯 Success Criteria

After loading the extension, you should see:
- ✅ Job title captured correctly
- ✅ Description captured correctly
- ✅ Apply button detected
- ⚠️ Company name (verify after testing)
- ⚠️ Location (verify after testing)

## 📝 Notes

- Naukri uses "Apply on company site" which means it redirects to external sites
- This is perfect for our external apply flow
- The job will be cached and you'll confirm it later via the extension popup
- The extension will show a badge reminder (⓵)

## 🐛 Debugging

If something doesn't work:
1. Check console for `[JobTracker] Naukri content script loaded`
2. Click buttons and watch for `[JobTracker] Naukri button clicked`
3. Check if job details are extracted correctly
4. Look for any error messages

Good luck! 🚀
