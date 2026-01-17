# Chrome Extension Advanced Topics

## 3. Tabs API

Interact with browser tabs.

```javascript
// Get current tab
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// Create new tab
await chrome.tabs.create({ url: "https://google.com" });

// Update tab
await chrome.tabs.update(tabId, { url: "https://example.com" });

// Close tab
await chrome.tabs.remove(tabId);

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("Tab loaded:", tab.url);
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab activated:", activeInfo.tabId);
});
```

### 4. Context Menus

Add right-click menu items.

```javascript
// manifest.json
{
  "permissions": ["contextMenus"]
}

// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveJob",
    title: "Save to JobTracker",
    contexts: ["selection"] // Show when text is selected
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveJob") {
    console.log("Selected text:", info.selectionText);
  }
});
```

### 5. Web Requests

Intercept and modify network requests.

```javascript
// manifest.json
{
  "permissions": ["webRequest", "webRequestBlocking"],
  "host_permissions": ["https://api.example.com/*"]
}

// background.js
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log("Request to:", details.url);
    
    // Block request
    return { cancel: true };
    
    // Redirect request
    return { redirectUrl: "https://other.com" };
  },
  { urls: ["https://api.example.com/*"] },
  ["blocking"]
);
```

### 6. Cookies

Read and modify cookies.

```javascript
// manifest.json
{
  "permissions": ["cookies"],
  "host_permissions": ["https://example.com/*"]
}

// Get cookie
const cookie = await chrome.cookies.get({
  url: "https://example.com",
  name: "session"
});

// Set cookie
await chrome.cookies.set({
  url: "https://example.com",
  name: "session",
  value: "abc123"
});

// Remove cookie
await chrome.cookies.remove({
  url: "https://example.com",
  name: "session"
});
```

---

## Debugging & Testing

### 1. Debugging Content Scripts

**Open DevTools on the page:**
1. Go to the website where content script runs
2. Press F12 to open DevTools
3. Go to Console tab
4. Your console.log() from content.js will appear here

**Inspect elements:**
```javascript
// content.js
console.log("Content script loaded");
console.log("Job title:", document.querySelector("h1")?.innerText);
```

### 2. Debugging Background Script

**Open Service Worker DevTools:**
1. Go to `chrome://extensions`
2. Find your extension
3. Click "service worker" link
4. DevTools opens for background script

**Logs:**
```javascript
// background.js
console.log("Background script started");
console.log("Message received:", message);
```

### 3. Debugging Popup

**Open Popup DevTools:**
1. Right-click extension icon
2. Select "Inspect popup"
3. DevTools opens for popup

**Or:**
1. Click extension icon to open popup
2. Right-click inside popup
3. Select "Inspect"

### 4. Common Errors

#### "Extension context invalidated"
**Cause:** Extension was reloaded while page was open
**Fix:** Reload the page

#### "Cannot read property of undefined"
**Cause:** Element not found on page
**Fix:** Use optional chaining `?.`

```javascript
// Bad
const text = document.querySelector("h1").innerText; // Crashes if not found

// Good
const text = document.querySelector("h1")?.innerText || ""; // Safe
```

#### "Unchecked runtime.lastError"
**Cause:** Async operation failed
**Fix:** Check for errors

```javascript
chrome.storage.local.get("key", (result) => {
  if (chrome.runtime.lastError) {
    console.error("Error:", chrome.runtime.lastError);
    return;
  }
  console.log("Result:", result);
});
```

### 5. Testing Checklist

- [ ] Test on fresh Chrome profile
- [ ] Test with extension reloaded
- [ ] Test with slow network
- [ ] Test with no network
- [ ] Test error scenarios
- [ ] Test on different websites
- [ ] Check console for errors
- [ ] Verify permissions work
- [ ] Test storage limits
- [ ] Test message passing

---

## Best Practices

### 1. Error Handling

Always handle errors gracefully.

```javascript
// Bad
const response = await fetch(url);
const data = await response.json();

// Good
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error("Fetch failed:", error);
  showNotification("Error: " + error.message);
  return null;
}
```

### 2. Async/Await vs Callbacks

Prefer async/await over callbacks.

```javascript
// Old way (callbacks)
chrome.storage.local.get("key", (result) => {
  console.log(result.key);
});

// New way (async/await)
const { key } = await chrome.storage.local.get("key");
console.log(key);
```

### 3. Memory Management

Clean up event listeners and timers.

```javascript
// Bad - memory leak
setInterval(() => {
  console.log("Running forever");
}, 1000);

// Good - clean up
const intervalId = setInterval(() => {
  console.log("Running");
}, 1000);

// Later...
clearInterval(intervalId);
```

### 4. Performance

Minimize DOM queries.

```javascript
// Bad - queries DOM multiple times
for (let i = 0; i < 100; i++) {
  document.querySelector(".container").appendChild(element);
}

// Good - query once
const container = document.querySelector(".container");
for (let i = 0; i < 100; i++) {
  container.appendChild(element);
}
```

### 5. Security

Never use eval() or innerHTML with user input.

```javascript
// Bad - XSS vulnerability
element.innerHTML = userInput;

// Good - safe
element.textContent = userInput;
```

---

## Common Patterns

### Pattern 1: Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

### Pattern 2: Debouncing

```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log("Searching for:", query);
}, 500);

input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```

### Pattern 3: State Management

```javascript
class ExtensionState {
  constructor() {
    this.data = {};
  }
  
  async load() {
    this.data = await chrome.storage.local.get(null);
  }
  
  async set(key, value) {
    this.data[key] = value;
    await chrome.storage.local.set({ [key]: value });
  }
  
  get(key) {
    return this.data[key];
  }
}

// Usage
const state = new ExtensionState();
await state.load();
await state.set("count", 5);
console.log(state.get("count")); // 5
```

---

## Resources

### Official Documentation
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/intro/
- API Reference: https://developer.chrome.com/docs/extensions/reference/

### Tutorials
- Getting Started: https://developer.chrome.com/docs/extensions/mv3/getstarted/
- Samples: https://github.com/GoogleChrome/chrome-extensions-samples

### Tools
- Extension Reloader: Auto-reload extension during development
- Chrome DevTools: Built-in debugging tools
- Lighthouse: Performance testing

---

## Next Steps

1. **Read the official docs**: Start with "Getting Started"
2. **Build simple extensions**: Word counter, tab manager, etc.
3. **Study open-source extensions**: Learn from others
4. **Experiment**: Try different APIs
5. **Publish**: Share your extension on Chrome Web Store

**Remember:** The best way to learn is by building! Start small, iterate, and gradually add complexity.
