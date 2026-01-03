# Naukri Extension Implementation Checklist

## ✅ Completed Steps

- [x] Created `shared.js` with reusable functions
- [x] Created `content-naukri.js` template
- [x] Updated `manifest.json` to include Naukri
- [x] Updated `background.js` to handle platform parameter
- [x] Updated `content.js` to use shared functions
- [x] Created setup guide and test helper

## 📋 Your Action Items

### 1. Find Naukri Selectors (15 minutes)

- [ ] Open a Naukri job page in Chrome
- [ ] Open DevTools Console (F12)
- [ ] Copy-paste `test-helper.js` content into console
- [ ] Note down the working selectors
- [ ] Take screenshots if needed

### 2. Update content-naukri.js (10 minutes)

- [ ] Open `extension/content-naukri.js`
- [ ] Replace placeholder selectors with actual ones
- [ ] Update `extractJobDetails()` function
- [ ] Update button detection in click listener
- [ ] Save the file

### 3. Load Extension in Chrome (5 minutes)

- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode" (top right)
- [ ] Click "Load unpacked"
- [ ] Select your `extension` folder
- [ ] Extension should appear in the list

### 4. Test on Naukri (10 minutes)

- [ ] Open a Naukri job page
- [ ] Open DevTools Console (F12)
- [ ] Look for: `[JobTracker] Naukri content script loaded`
- [ ] Click any button and check console logs
- [ ] Click the Apply button
- [ ] Verify job details are extracted correctly

### 5. Test Full Flow (10 minutes)

- [ ] Click Apply on a Naukri job
- [ ] Blue notification should appear
- [ ] Extension icon should show badge (⓵)
- [ ] Click extension icon
- [ ] Pending job should be listed
- [ ] Click "Yes, I applied"
- [ ] Job should save to your backend
- [ ] Success notification should appear

### 6. Test Edge Cases (Optional)

- [ ] Test with jobs that have no location
- [ ] Test with jobs that have no description
- [ ] Test clicking non-apply buttons
- [ ] Test with multiple pending jobs
- [ ] Test canceling a pending job

## 🐛 Troubleshooting

### If button clicks aren't detected:
1. Check console for button click logs
2. Verify button selector patterns
3. Try clicking different buttons to see their properties

### If job details are empty:
1. Run `test-helper.js` again
2. Inspect the page manually
3. Update selectors in `content-naukri.js`

### If extension doesn't load:
1. Check for errors in `chrome://extensions/`
2. Click "Errors" button if present
3. Fix any syntax errors
4. Click reload button

### If backend save fails:
1. Check if you're logged in (extension popup)
2. Verify backend is running
3. Check network tab in DevTools
4. Look for error messages

## 📚 Files You'll Edit

1. **`extension/content-naukri.js`** - Main file to update with selectors
2. **`extension/manifest.json`** - Already updated (no changes needed)
3. **`extension/background.js`** - Already updated (no changes needed)

## 🎯 Success Criteria

- ✅ Naukri job details are extracted correctly
- ✅ Apply button is detected
- ✅ Job is cached when Apply is clicked
- ✅ Badge appears on extension icon
- ✅ Pending job shows in popup
- ✅ Job saves to backend when confirmed
- ✅ Works for both LinkedIn and Naukri

## 📞 Need Help?

If you get stuck:
1. Check the console logs (they're very detailed)
2. Review `NAUKRI_SETUP_GUIDE.md`
3. Use `test-helper.js` to find correct selectors
4. Test one step at a time

Good luck! 🚀
