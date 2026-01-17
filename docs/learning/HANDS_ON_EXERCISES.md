# Chrome Extension - Hands-On Exercises

Learn by building! Complete these exercises to master Chrome extensions.

---

## Exercise 1: Hello World Extension (15 minutes)

**Goal:** Create your first extension that shows a popup with "Hello World"

### Steps:

1. Create a new folder: `hello-world-extension`

2. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Hello World",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup.html"
  }
}
```

3. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 200px;
      padding: 20px;
      font-family: Arial;
    }
  </style>
</head>
<body>
  <h1>Hello World!</h1>
  <p>My first extension</p>
</body>
</html>
```

4. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your folder

5. Test:
   - Click the extension icon
   - You should see "Hello World!"

**Challenge:** Add a button that shows an alert when clicked.

---

## Exercise 2: Page Title Changer (20 minutes)

**Goal:** Create an extension that changes the title of any webpage

### Steps:

1. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Title Changer",
  "version": "1.0.0",
  "permissions": ["activeTab"],
  "action": {
    "default_popup": "popup.html"
  }
}
```

2. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 20px; }
    input { width: 100%; padding: 8px; margin-bottom: 10px; }
    button { width: 100%; padding: 10px; background: #4285f4; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Change Page Title</h2>
  <input type="text" id="newTitle" placeholder="Enter new title">
  <button id="changeBtn">Change Title</button>
  <script src="popup.js"></script>
</body>
</html>
```

3. Create `popup.js`:
```javascript
document.getElementById("changeBtn").addEventListener("click", async () => {
  const newTitle = document.getElementById("newTitle").value;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (title) => {
      document.title = title;
    },
    args: [newTitle]
  });
});
```

4. Test:
   - Load the extension
   - Go to any website
   - Click extension icon
   - Enter a new title
   - Click "Change Title"

**Challenge:** Make the title change persist even after page reload (hint: use content script + storage).

---

## Exercise 3: Background Color Picker (25 minutes)

**Goal:** Create an extension that changes the background color of any page

### Steps:

1. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Color Picker",
  "version": "1.0.0",
  "permissions": ["activeTab", "storage"],
  "action": {
    "default_popup": "popup.html"
  }
}
```

2. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 250px; padding: 20px; }
    .color-btn {
      width: 50px;
      height: 50px;
      margin: 5px;
      border: 2px solid #ccc;
      cursor: pointer;
      display: inline-block;
    }
    .color-btn:hover { border-color: #000; }
  </style>
</head>
<body>
  <h2>Pick a Color</h2>
  <div>
    <div class="color-btn" style="background: #ff6b6b" data-color="#ff6b6b"></div>
    <div class="color-btn" style="background: #4ecdc4" data-color="#4ecdc4"></div>
    <div class="color-btn" style="background: #45b7d1" data-color="#45b7d1"></div>
    <div class="color-btn" style="background: #f9ca24" data-color="#f9ca24"></div>
    <div class="color-btn" style="background: #6c5ce7" data-color="#6c5ce7"></div>
    <div class="color-btn" style="background: #ffffff" data-color="#ffffff"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

3. Create `popup.js`:
```javascript
document.querySelectorAll(".color-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const color = btn.dataset.color;
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (bgColor) => {
        document.body.style.backgroundColor = bgColor;
      },
      args: [color]
    });
    
    // Save the color
    await chrome.storage.local.set({ lastColor: color });
  });
});
```

**Challenge:** Add a "Reset" button that restores the original background color.

---

## Exercise 4: Word Highlighter (30 minutes)

**Goal:** Create an extension that highlights all occurrences of a word on a page

### Steps:

1. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Word Highlighter",
  "version": "1.0.0",
  "permissions": ["activeTab"],
  "action": {
    "default_popup": "popup.html"
  }
}
```

2. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 20px; }
    input { width: 100%; padding: 8px; margin-bottom: 10px; }
    button { width: 100%; padding: 10px; margin-bottom: 5px; }
    .highlight-btn { background: #ffd93d; color: #000; border: none; cursor: pointer; }
    .clear-btn { background: #6c757d; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Highlight Words</h2>
  <input type="text" id="wordInput" placeholder="Enter word to highlight">
  <button class="highlight-btn" id="highlightBtn">Highlight</button>
  <button class="clear-btn" id="clearBtn">Clear Highlights</button>
  <script src="popup.js"></script>
</body>
</html>
```

3. Create `popup.js`:
```javascript
document.getElementById("highlightBtn").addEventListener("click", async () => {
  const word = document.getElementById("wordInput").value;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: highlightWord,
    args: [word]
  });
});

document.getElementById("clearBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: clearHighlights
  });
});

function highlightWord(word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  
  function highlightNode(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent;
      if (regex.test(text)) {
        const span = document.createElement('span');
        span.innerHTML = text.replace(regex, '<mark style="background: #ffd93d;">$&</mark>');
        node.parentNode.replaceChild(span, node);
      }
    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      Array.from(node.childNodes).forEach(highlightNode);
    }
  }
  
  highlightNode(document.body);
}

function clearHighlights() {
  document.querySelectorAll('mark').forEach(mark => {
    const text = document.createTextNode(mark.textContent);
    mark.parentNode.replaceChild(text, mark);
  });
}
```

**Challenge:** Add a counter that shows how many times the word appears.

---

## Exercise 5: Tab Manager (35 minutes)

**Goal:** Create an extension that lists all open tabs and allows closing them

### Steps:

1. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Tab Manager",
  "version": "1.0.0",
  "permissions": ["tabs"],
  "action": {
    "default_popup": "popup.html"
  }
}
```

2. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 400px; max-height: 600px; padding: 20px; overflow-y: auto; }
    .tab-item {
      padding: 10px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tab-title { flex: 1; font-size: 14px; }
    .close-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
    .close-btn:hover { background: #c82333; }
  </style>
</head>
<body>
  <h2>Open Tabs</h2>
  <div id="tabsList"></div>
  <script src="popup.js"></script>
</body>
</html>
```

3. Create `popup.js`:
```javascript
async function loadTabs() {
  const tabs = await chrome.tabs.query({});
  const tabsList = document.getElementById("tabsList");
  
  tabsList.innerHTML = tabs.map(tab => `
    <div class="tab-item">
      <div class="tab-title">${tab.title}</div>
      <button class="close-btn" data-tab-id="${tab.id}">Close</button>
    </div>
  `).join('');
  
  // Add event listeners
  document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const tabId = parseInt(e.target.dataset.tabId);
      await chrome.tabs.remove(tabId);
      loadTabs(); // Reload list
    });
  });
}

loadTabs();
```

**Challenge:** Add a "Close All" button and a search filter.

---

## Exercise 6: Notification Reminder (40 minutes)

**Goal:** Create an extension that shows a notification after a set time

### Steps:

1. Create `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Reminder",
  "version": "1.0.0",
  "permissions": ["alarms", "notifications"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

2. Create `popup.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 20px; }
    input, select { width: 100%; padding: 8px; margin-bottom: 10px; }
    button { width: 100%; padding: 10px; background: #28a745; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Set Reminder</h2>
  <input type="text" id="message" placeholder="Reminder message">
  <select id="time">
    <option value="1">1 minute</option>
    <option value="5">5 minutes</option>
    <option value="10">10 minutes</option>
    <option value="30">30 minutes</option>
  </select>
  <button id="setBtn">Set Reminder</button>
  <script src="popup.js"></script>
</body>
</html>
```

3. Create `popup.js`:
```javascript
document.getElementById("setBtn").addEventListener("click", async () => {
  const message = document.getElementById("message").value;
  const minutes = parseInt(document.getElementById("time").value);
  
  await chrome.runtime.sendMessage({
    type: "SET_REMINDER",
    message: message,
    minutes: minutes
  });
  
  alert(`Reminder set for ${minutes} minute(s)!`);
  window.close();
});
```

4. Create `background.js`:
```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_REMINDER") {
    chrome.alarms.create("reminder", {
      delayInMinutes: message.minutes
    });
    
    // Store message
    chrome.storage.local.set({ reminderMessage: message.message });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "reminder") {
    const { reminderMessage } = await chrome.storage.local.get("reminderMessage");
    
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png", // You'll need to add an icon
      title: "Reminder!",
      message: reminderMessage || "Time's up!",
      priority: 2
    });
  }
});
```

**Challenge:** Add the ability to cancel a reminder and show remaining time.

---

## Exercise 7: Mini JobTracker (60 minutes)

**Goal:** Build a simplified version of JobTracker

### Requirements:
1. Content script that detects button clicks on a test page
2. Extract "job" data (title, company)
3. Save to storage
4. Show in popup
5. Clear all jobs button

### Hints:
- Create a simple HTML test page with fake job listings
- Use content script to detect clicks
- Use chrome.storage.local to save jobs
- Display jobs in popup with a list

This exercise will help you understand the core concepts of your JobTracker extension!

---

## Debugging Tips

### View Console Logs

**Content Script:**
- Open DevTools on the webpage (F12)
- Console tab shows content script logs

**Background Script:**
- Go to chrome://extensions
- Click "service worker" link
- Console opens for background script

**Popup:**
- Right-click extension icon → Inspect popup
- Or right-click inside popup → Inspect

### Common Issues

**"Extension context invalidated"**
- Reload the page after reloading extension

**Element not found**
- Use optional chaining: `element?.property`
- Check if element exists before accessing

**Async issues**
- Use async/await properly
- Return true in message listeners for async responses

---

## Next Steps

After completing these exercises:

1. Study the JobTracker extension code
2. Try modifying JobTracker to add new features
3. Build your own extension idea
4. Publish to Chrome Web Store

**Remember:** The best way to learn is by doing. Don't just read the code—type it out, break it, fix it, and experiment!
