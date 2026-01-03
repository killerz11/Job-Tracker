# 🎯 Naukri Extension Setup - Complete Guide

## What Was Done

Your extension has been **prepared** to support Naukri. Here's what's ready:

### ✅ Files Created/Updated

1. **`shared.js`** - Reusable functions for both platforms
2. **`content-naukri.js`** - Naukri tracking script (needs selectors)
3. **`manifest.json`** - Updated to include Naukri
4. **`background.js`** - Updated to handle "naukri" platform
5. **`content.js`** - Refactored to use shared functions

### ✅ What Works Now

- Extension loads on both LinkedIn and Naukri pages
- Shared notification system
- Shared job caching system
- Backend API accepts "naukri" platform
- Popup handles jobs from both platforms

## What You Need to Do

### The Only Thing Missing: Naukri DOM Selectors

You need to find and update the CSS selectors in `content-naukri.js` because:
- Every website has different HTML structure
- Naukri's job title might be in `.jd-header-title` or `.title` or something else
- Only you can inspect Naukri's actual page to find the correct selectors

## 📖 Documentation Created

| File | Purpose |
|------|---------|
| `QUICK_START.md` | 5-minute setup guide |
| `NAUKRI_SETUP_GUIDE.md` | Detailed step-by-step instructions |
| `CHECKLIST.md` | Complete checklist with troubleshooting |
| `ARCHITECTURE.md` | How everything works together |
| `test-helper.js` | Script to find Naukri selectors automatically |

## 🚀 Quick Start (5 Minutes)

### 1. Find Selectors
```bash
# Open any Naukri job page
# Press F12 → Console
# Copy-paste test-helper.js content
# Note the ✅ working selectors
```

### 2. Update content-naukri.js
```javascript
// Replace these lines (around line 20):
jobTitle: document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",
companyName: document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",
location: document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim() || "",
description: document.querySelector(".YOUR-ACTUAL-SELECTOR")?.innerText.trim().slice(0, 5000) || "",

// And button detection (around line 90):
if (
  text === "apply" ||
  classes.includes("YOUR-ACTUAL-BUTTON-CLASS")
) {
```

### 3. Load Extension
```bash
chrome://extensions/
→ Enable "Developer mode"
→ Click "Load unpacked"
→ Select extension folder
```

### 4. Test
```bash
# Open Naukri job page
# Click Apply button
# Check console for logs
# Click extension icon
# Confirm the job
```

## 📋 Example: What to Look For

When you run `test-helper.js`, you'll see output like:

```
📌 JOB TITLE:
✅ .jd-header-title → "Senior Software Engineer"
✅ h1 → "Senior Software Engineer"

🏢 COMPANY NAME:
✅ .comp-name a → "Google"

📍 LOCATION:
✅ .loc-wrap → "Bangalore, India"

📄 DESCRIPTION:
✅ .dang-inner-html → "We are looking for..."

🔘 APPLY BUTTONS:
✅ Found: "apply" | class="apply-button" | id="apply-btn"
```

Then update `content-naukri.js`:

```javascript
jobTitle: document.querySelector(".jd-header-title")?.innerText.trim() || "",
companyName: document.querySelector(".comp-name a")?.innerText.trim() || "",
location: document.querySelector(".loc-wrap")?.innerText.trim() || "",
description: document.querySelector(".dang-inner-html")?.innerText.trim().slice(0, 5000) || "",

// Button detection:
if (
  text === "apply" ||
  classes.includes("apply-button") ||
  id.includes("apply-btn")
) {
```

## 🎯 Success Criteria

After setup, your extension should:

- ✅ Work on LinkedIn (already working)
- ✅ Work on Naukri (after you add selectors)
- ✅ Show notifications when Apply is clicked
- ✅ Cache jobs with badge indicator
- ✅ Save to backend when confirmed
- ✅ Handle both platforms seamlessly

## 🐛 Troubleshooting

### Console shows "Job details are empty"
→ Selectors are wrong, run `test-helper.js` again

### Apply button not detected
→ Check console logs for button properties, update detection logic

### Extension doesn't load
→ Check `chrome://extensions/` for errors

### Backend save fails
→ Verify you're logged in and backend is running

## 📚 Next Steps

1. **Read `QUICK_START.md`** for fastest setup
2. **Use `test-helper.js`** to find selectors
3. **Update `content-naukri.js`** with selectors
4. **Test** on real Naukri pages
5. **Iterate** until everything works

## 💡 Pro Tips

- Start with one selector at a time
- Test after each change
- Console logs are your friend
- Naukri might have different layouts for different job types
- Add multiple fallback selectors for reliability

## 🎉 That's It!

The hard work is done. You just need to:
1. Find the selectors (5 min)
2. Update one file (2 min)
3. Test (3 min)

Total time: ~10 minutes

Good luck! 🚀
