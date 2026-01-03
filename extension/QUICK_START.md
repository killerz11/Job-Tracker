# 🚀 Quick Start - Add Naukri Support

## Step 1: Find Selectors (2 minutes)

```bash
1. Open any Naukri job page
2. Press F12 (DevTools)
3. Go to Console tab
4. Copy-paste content from test-helper.js
5. Note the ✅ working selectors
```

## Step 2: Update content-naukri.js (3 minutes)

Replace the TODO selectors with your findings:

```javascript
// Line ~20 in content-naukri.js
jobTitle: document.querySelector(".YOUR-SELECTOR")?.innerText.trim() || "",
companyName: document.querySelector(".YOUR-SELECTOR")?.innerText.trim() || "",
location: document.querySelector(".YOUR-SELECTOR")?.innerText.trim() || "",
description: document.querySelector(".YOUR-SELECTOR")?.innerText.trim().slice(0, 5000) || "",
```

And button detection:

```javascript
// Line ~90 in content-naukri.js
if (
  text === "apply" ||
  classes.includes("YOUR-BUTTON-CLASS") ||
  id.includes("YOUR-BUTTON-ID")
) {
```

## Step 3: Load Extension (1 minute)

```bash
1. chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension folder
```

## Step 4: Test (2 minutes)

```bash
1. Open Naukri job page
2. F12 → Console
3. Click Apply button
4. Check logs for extracted data
5. Click extension icon
6. Confirm the job
```

## That's it! 🎉

Your extension now works on both LinkedIn and Naukri.

---

**Need detailed help?** → Read `NAUKRI_SETUP_GUIDE.md`

**Step-by-step checklist?** → Read `CHECKLIST.md`

**Find selectors?** → Use `test-helper.js`
