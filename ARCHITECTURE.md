# JobTracker Extension Architecture

**Version:** 2.0 (Refactored)  
**Date:** January 8, 2026  
**Approach:** Hybrid (OOP where beneficial, Functional elsewhere)

---

## 🎯 Design Principles

1. **Pragmatic OOP** - Use classes only where inheritance/encapsulation helps
2. **Functional First** - Default to functions for stateless logic
3. **Single Responsibility** - Each file has one clear purpose
4. **Easy to Test** - Clear boundaries between modules
5. **Easy to Extend** - Adding new platforms should be simple

---

## 📁 File Structure

```
extension/
│
├── core/                          # Functional utilities (stateless)
│   ├── storage.js                 # Chrome storage wrapper
│   ├── messaging.js               # Chrome messaging helpers
│   └── logger.js                  # Consistent logging
│
├── platforms/                     # OOP (inheritance benefit)
│   ├── BasePlatform.js           # Abstract base class
│   ├── LinkedInPlatform.js       # LinkedIn implementation
│   └── NaukriPlatform.js         # Naukri implementation
│
├── services/                      # Mixed approach
│   ├── jobExtractor.js           # Functional (uses platforms)
│   ├── JobQueue.js               # Class (stateful)
│   └── ApiClient.js              # Class (stateful)
│
├── ui/                            # Functional (stateless)
│   ├── notifications.js          # Page notifications
│   └── modals.js                 # Confirmation modals
│
├── content-script.js             # Entry point for content scripts
├── background.js                 # Background service worker
├── popup.js                      # Popup UI
├── popup.html                    # Popup HTML
├── settings.js                   # Settings page
├── settings.html                 # Settings HTML
├── config.js                     # Configuration
└── manifest.json                 # Extension manifest
```

---

## 🔄 Data Flow

```
User clicks "Apply"
        ↓
content-script.js detects click
        ↓
Platform detector identifies site (LinkedIn/Naukri)
        ↓
Platform.extractJobDetails() gets job data
        ↓
JobQueue.add(job) adds to queue
        ↓
chrome.runtime.sendMessage() → background.js
        ↓
ApiClient.saveJob() sends to backend
        ↓
Success: Show notification
Failure: Save to local queue for retry
```

---

## 📦 Module Details

### 1. Core Modules (Functional)

#### `core/storage.js`
**Purpose:** Wrapper around chrome.storage with promises  
**Exports:** Functions  
**Why Functional:** Stateless operations

```javascript
export async function get(key)
export async function set(key, value)
export async function remove(key)
export async function getPendingJobs()
export async function addPendingJob(job)
export async function removePendingJob(jobId)
```

#### `core/messaging.js`
**Purpose:** Helper for chrome.runtime messaging  
**Exports:** Functions  
**Why Functional:** Stateless wrappers

```javascript
export async function sendMessage(type, data)
export function onMessage(type, handler)
```

#### `core/logger.js`
**Purpose:** Consistent logging with prefixes  
**Exports:** Functions  
**Why Functional:** Stateless logging

```javascript
export function info(message, data)
export function error(message, error)
export function debug(message, data)
```

---

### 2. Platform Modules (OOP)

#### `platforms/BasePlatform.js`
**Purpose:** Abstract base class for all job platforms  
**Type:** ES6 Class  
**Why OOP:** Inheritance prevents code duplication

```javascript
class BasePlatform {
  constructor(name)
  
  // Abstract methods (must implement)
  extractJobDetails()
  detectApplyButton(button)
  
  // Shared helper methods
  trySelectors(strategies)
  cleanText(text)
  querySelector(selectors)
}
```

**Key Features:**
- Multiple selector strategies for resilience
- Shared text cleaning logic
- Fallback mechanisms

#### `platforms/LinkedInPlatform.js`
**Purpose:** LinkedIn-specific implementation  
**Type:** ES6 Class (extends BasePlatform)  
**Why OOP:** Inherits shared logic, overrides specifics

```javascript
class LinkedInPlatform extends BasePlatform {
  constructor()
  
  extractJobDetails()      // Multiple layout strategies
  detectApplyButton()      // Easy Apply vs External
  
  // Private helpers
  _extractV1()            // Current layout
  _extractV2()            // Alternative layout
  _extractFallback()      // Last resort
}
```

**Selector Strategies:**
1. Primary selectors (current LinkedIn layout)
2. Alternative selectors (A/B test layouts)
3. Fallback selectors (generic patterns)

#### `platforms/NaukriPlatform.js`
**Purpose:** Naukri-specific implementation  
**Type:** ES6 Class (extends BasePlatform)  
**Why OOP:** Same benefits as LinkedIn

```javascript
class NaukriPlatform extends BasePlatform {
  constructor()
  
  extractJobDetails()
  detectApplyButton()
}
```

---

### 3. Service Modules (Mixed)

#### `services/jobExtractor.js`
**Purpose:** Coordinates job extraction across platforms  
**Type:** Functional  
**Why Functional:** Stateless coordination

```javascript
export function getCurrentPlatform()
export function extractJob()
export function detectApplyType(button)
```

**How it works:**
- Detects current site (linkedin.com, naukri.com)
- Returns appropriate platform instance
- Delegates extraction to platform

#### `services/JobQueue.js`
**Purpose:** Manages job queue with retry logic  
**Type:** ES6 Class  
**Why OOP:** Manages state (queue, processing flag)

```javascript
class JobQueue {
  constructor()
  
  add(job)                // Add job to queue
  process()               // Process queue
  retry()                 // Retry failed jobs
  _saveFailed(job, error) // Save to storage
  _loadFailed()           // Load from storage
}
```

**Features:**
- Sequential processing (no race conditions)
- Automatic retry with exponential backoff
- Persistent storage for failed jobs
- Manual retry trigger

#### `services/ApiClient.js`
**Purpose:** Handles all backend API calls  
**Type:** ES6 Class  
**Why OOP:** Manages state (auth token, base URL)

```javascript
class ApiClient {
  constructor()
  
  async init()            // Load config
  async saveJob(jobData)
  async getJobs(page, limit)
  async updateJob(id, data)
  
  _getAuthToken()         // Private helper
  _handleError(error)     // Private helper
}
```

**Features:**
- Centralized error handling
- Auth token management
- Configurable base URL
- Retry logic for network errors

---

### 4. UI Modules (Functional)

#### `ui/notifications.js`
**Purpose:** Show notifications on page  
**Type:** Functional  
**Why Functional:** Stateless UI operations

```javascript
export function showNotification(message, type)
export function showExternalApplyNotification(jobData)
export function hideNotification()
```

#### `ui/modals.js`
**Purpose:** Show confirmation modals  
**Type:** Functional  
**Why Functional:** Stateless UI operations

```javascript
export function showConfirmationModal(jobData, onConfirm, onReject)
export function hideModal()
```

---

### 5. Entry Points (Functional)

#### `content-script.js`
**Purpose:** Main entry point for content scripts  
**Type:** Functional with instances  
**Pattern:** Event-driven

```javascript
import { getCurrentPlatform, extractJob, detectApplyType } from './services/jobExtractor.js';
import { JobQueue } from './services/JobQueue.js';
import { showNotification } from './ui/notifications.js';

const queue = new JobQueue();

document.addEventListener('click', async (e) => {
  const button = findButton(e.target);
  if (!button) return;
  
  const platform = getCurrentPlatform();
  const applyType = detectApplyType(button);
  
  if (applyType === 'EASY_APPLY') {
    await handleEasyApply(platform);
  } else if (applyType === 'EXTERNAL_APPLY') {
    await handleExternalApply(platform);
  }
});
```

#### `background.js`
**Purpose:** Background service worker  
**Type:** Functional with instances  
**Pattern:** Message-driven

```javascript
import { JobQueue } from './services/JobQueue.js';
import { ApiClient } from './services/ApiClient.js';

const queue = new JobQueue();
const api = new ApiClient();

const handlers = {
  'JOB_APPLICATION': handleJobApplication,
  'EXTERNAL_APPLY_CACHED': handleExternalApply,
  'UPDATE_BADGE': handleUpdateBadge,
  'RETRY_FAILED': handleRetryFailed
};

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  const handler = handlers[msg.type];
  if (handler) {
    handler(msg, sender)
      .then(respond)
      .catch(error => respond({ success: false, error: error.message }));
    return true;
  }
});
```

---

## 🎯 Key Design Decisions

### Why Hybrid (OOP + Functional)?

**Use Classes When:**
- ✅ Inheritance prevents code duplication (Platforms)
- ✅ State needs encapsulation (JobQueue, ApiClient)
- ✅ Multiple instances needed with different state

**Use Functions When:**
- ✅ Stateless operations (utilities, UI)
- ✅ Simple wrappers (storage, messaging)
- ✅ Event handlers

### Why This Structure?

**1. Platform Abstraction**
- Problem: LinkedIn and Naukri have 80% duplicate code
- Solution: BasePlatform with shared logic
- Benefit: Add new platform in ~50 lines

**2. Job Queue**
- Problem: Jobs lost if backend is down
- Solution: Queue with retry and persistence
- Benefit: Reliable tracking

**3. Centralized API Client**
- Problem: API calls scattered everywhere
- Solution: Single ApiClient class
- Benefit: Easy to add auth, retry, monitoring

**4. Functional Utilities**
- Problem: No need for state in utilities
- Solution: Simple exported functions
- Benefit: Easy to understand and test

---

## 🔄 Migration Strategy

### Phase 1: Core Utilities (Day 1)
**Goal:** Extract utilities without breaking anything

1. Create `core/storage.js` - wrap chrome.storage
2. Create `core/messaging.js` - wrap chrome.runtime
3. Create `core/logger.js` - consistent logging
4. Update existing code to use new utilities
5. Test: Everything still works

**Risk:** Low (just wrappers)

### Phase 2: Platform Abstraction (Day 2)
**Goal:** Extract platform-specific logic

1. Create `platforms/BasePlatform.js`
2. Create `platforms/LinkedInPlatform.js`
3. Create `platforms/NaukriPlatform.js`
4. Create `services/jobExtractor.js`
5. Update content scripts to use platforms
6. Test: LinkedIn and Naukri still work

**Risk:** Medium (major refactor)

### Phase 3: Services (Day 3)
**Goal:** Add queue and API client

1. Create `services/JobQueue.js`
2. Create `services/ApiClient.js`
3. Update background.js to use services
4. Update content-script.js to use queue
5. Test: Jobs still save, retry works

**Risk:** Medium (new functionality)

### Phase 4: UI Cleanup (Day 4)
**Goal:** Extract UI logic

1. Create `ui/notifications.js`
2. Create `ui/modals.js`
3. Update content scripts to use UI modules
4. Remove duplicate UI code
5. Test: Notifications and modals work

**Risk:** Low (just extraction)

### Phase 5: Testing & Polish (Day 5)
**Goal:** Ensure everything works

1. Test all flows (Easy Apply, External Apply)
2. Test error scenarios (backend down, network error)
3. Test retry logic
4. Fix any bugs
5. Update documentation

**Risk:** Low (just testing)

---

## 📊 Before vs After

### Before (Current)
```
extension/
├── content-linkedin.js    (400 lines, does everything)
├── content-naukri.js      (300 lines, 80% duplicate)
├── shared.js              (500 lines, mixed responsibilities)
├── background.js          (150 lines, giant if-else)
└── popup.js               (200 lines)

Total: ~1550 lines in 5 files
```

**Problems:**
- ❌ Code duplication
- ❌ Mixed responsibilities
- ❌ Hard to test
- ❌ Hard to extend
- ❌ No error recovery

### After (Refactored)
```
extension/
├── core/                  (3 files, ~150 lines)
├── platforms/             (3 files, ~300 lines)
├── services/              (3 files, ~400 lines)
├── ui/                    (2 files, ~200 lines)
└── [entry points]         (3 files, ~300 lines)

Total: ~1350 lines in 14 files
```

**Benefits:**
- ✅ No duplication
- ✅ Clear responsibilities
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Error recovery built-in
- ✅ 200 lines less code

---

## 🧪 Testing Strategy

### Unit Tests
- `core/storage.js` - Mock chrome.storage
- `core/messaging.js` - Mock chrome.runtime
- `platforms/LinkedInPlatform.js` - Mock DOM
- `services/JobQueue.js` - Test queue logic
- `services/ApiClient.js` - Mock fetch

### Integration Tests
- Platform detection → extraction → queue
- Queue → background → API
- Error scenarios → retry logic

### Manual Tests
- LinkedIn Easy Apply
- LinkedIn External Apply
- Naukri Apply
- Backend down scenario
- Network error scenario

---

## 📚 Learning Resources

### OOP Basics (for platforms)
- Classes and inheritance
- Constructor and methods
- Public vs private methods
- `super()` keyword

### ES6 Modules
- `import` and `export`
- Default vs named exports
- Module bundling (if needed)

### Chrome Extension APIs
- chrome.storage
- chrome.runtime.sendMessage
- Service workers

---

## 🎯 Success Criteria

**After refactoring, you should be able to:**

1. ✅ Add a new platform (Indeed) in ~50 lines
2. ✅ Understand what each file does in 30 seconds
3. ✅ Fix a bug without touching multiple files
4. ✅ Test individual modules in isolation
5. ✅ Explain the architecture to someone else

---

## 🤔 Open Questions

**Before we start, decide:**

1. **Module System:** Use ES6 modules or keep scripts?
   - ES6 modules = cleaner but needs bundling
   - Scripts = works now but messier imports

2. **TypeScript:** Add it now or later?
   - Now = more work but better long-term
   - Later = faster but need to convert

3. **Testing:** Write tests during or after refactor?
   - During = safer but slower
   - After = faster but riskier

**My recommendation:** ES6 modules, no TypeScript yet, tests after Phase 2.

---

**Ready to start Phase 1?**
