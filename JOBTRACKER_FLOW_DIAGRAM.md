# JobTracker Extension - Visual Flow Diagrams

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHROME BROWSER                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Popup      │    │  Background  │    │   Content    │    │
│  │  (popup.js)  │◄──►│(background.js)│◄──►│ (content.js) │    │
│  │              │    │              │    │              │    │
│  │ • Login UI   │    │ • API calls  │    │ • Detect     │    │
│  │ • Settings   │    │ • Notifs     │    │   clicks     │    │
│  │ • Pending    │    │ • Badge      │    │ • Extract    │    │
│  │   jobs       │    │              │    │   data       │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│         │                    │                    │            │
│         │                    │                    │            │
│         └────────────────────┴────────────────────┘            │
│                              │                                 │
│                    ┌─────────▼─────────┐                      │
│                    │  Chrome Storage   │                      │
│                    │  • authToken      │                      │
│                    │  • apiUrl         │                      │
│                    │  • pendingJobs    │                      │
│                    └───────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
                    ┌───────────────────┐
                    │  Your Backend API │
                    │  (Railway/Render) │
                    │                   │
                    │  • /api/auth/login│
                    │  • /api/jobs      │
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Database       │
                    │  (Neon Postgres)  │
                    └───────────────────┘
```

---

## Easy Apply Flow

```
USER ACTION                 CONTENT SCRIPT              BACKGROUND SCRIPT           BACKEND
─────────────────────────────────────────────────────────────────────────────────────────

1. Clicks "Easy Apply"
   on LinkedIn
                           │
                           ▼
                    Detects click
                    Caches job data
                           │
                           │
2. Fills form              │
   Clicks "Submit"         │
                           ▼
                    Detects submit
                    Waits 2 seconds
                    Checks if modal closed
                           │
                           │ sendMessage()
                           ├──────────────────────►
                           │                       Receives message
                           │                       Gets auth token
                           │                       from storage
                           │                              │
                           │                              │ POST /api/jobs
                           │                              ├──────────────────►
                           │                              │                   Saves to DB
                           │                              │◄──────────────────
                           │                              │ Response
                           │                       Shows notification
                           │◄──────────────────────┤
                           │ Response              │
                    Shows on-page
                    notification
                           │
                           ▼
3. User sees success
   message
```

---

## External Apply Flow

```
USER ACTION                 CONTENT SCRIPT              BACKGROUND SCRIPT           STORAGE
─────────────────────────────────────────────────────────────────────────────────────────

1. Clicks "Apply"
   (not Easy Apply)
                           │
                           ▼
                    Detects external apply
                    Extracts job data
                    Creates unique ID
                           │
                           │ storage.local.set()
                           ├──────────────────────────────────────────────►
                           │                                               Saves to
                           │                                               pendingJobs[]
                           │
                           │ sendMessage()
                           ├──────────────────────►
                           │                       Sets badge to "1"
                           │                       Shows browser notification
                           │
                    Shows blue notification
                    on page
                           │
                           ▼
2. User redirected to
   company website
   
3. User applies on
   company site
   
4. User returns to
   LinkedIn OR clicks
   extension icon
                           │
                           ▼
                    (If on LinkedIn)
                    Shows confirmation
                    modal
                           │
                    OR
                           │
                    (If clicks icon)
                    Popup checks storage
                           │◄──────────────────────────────────────────────┤
                           │                                               Gets pendingJobs[]
                    Shows pending jobs UI
                           │
                           ▼
5. User clicks
   "Yes, I applied"
                           │
                           │ sendMessage()
                           ├──────────────────────►
                           │                       Makes API call
                           │                       (same as Easy Apply)
                           │
                           │ storage.local.set()
                           ├──────────────────────────────────────────────►
                           │                                               Removes from
                           │                                               pendingJobs[]
                           │
                           │ sendMessage()
                           ├──────────────────────►
                           │                       Clears badge
                           │
                           ▼
6. Job saved to
   dashboard
```

---

## Message Passing Diagram

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Popup     │                    │ Background  │                    │   Content   │
│  (popup.js) │                    │(background) │                    │ (content.js)│
└─────────────┘                    └─────────────┘                    └─────────────┘
      │                                   │                                   │
      │ chrome.runtime.sendMessage()      │                                   │
      ├──────────────────────────────────►│                                   │
      │ { type: "GET_JOBS" }              │                                   │
      │                                   │                                   │
      │◄──────────────────────────────────┤                                   │
      │ { jobs: [...] }                   │                                   │
      │                                   │                                   │
      │                                   │ chrome.tabs.sendMessage()         │
      │                                   ├──────────────────────────────────►│
      │                                   │ { type: "UPDATE_UI" }             │
      │                                   │                                   │
      │                                   │◄──────────────────────────────────┤
      │                                   │ { success: true }                 │
      │                                   │                                   │
      │                                   │   chrome.runtime.sendMessage()    │
      │                                   │◄──────────────────────────────────┤
      │                                   │ { type: "JOB_APPLICATION" }       │
      │                                   │                                   │
      │                                   ├──────────────────────────────────►│
      │                                   │ { success: true }                 │
      │                                   │                                   │
```

---

## Storage Structure

```
chrome.storage.sync (Syncs across devices, 100KB limit)
├── apiUrl: "https://your-backend.railway.app"
├── dashboardUrl: "https://your-frontend.vercel.app"
└── authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

chrome.storage.local (Local only, 5MB limit)
└── pendingJobs: [
      {
        id: "job-1735660800000-abc123",
        companyName: "Google",
        jobTitle: "Software Engineer",
        location: "Mountain View, CA",
        description: "We are looking for...",
        jobUrl: "https://www.linkedin.com/jobs/view/123456",
        platform: "linkedin",
        status: "APPLIED",
        timestamp: 1735660800000,
        appliedAt: "2024-12-31T12:00:00.000Z"
      },
      {
        id: "job-1735660900000-def456",
        companyName: "Microsoft",
        jobTitle: "Product Manager",
        ...
      }
    ]
```

---

## API Request Flow

```
Extension                          Backend                         Database
────────                          ────────                        ────────

1. LOGIN
   POST /api/auth/login
   { email, password }
                                   │
                                   ▼
                            Verify credentials
                            Generate JWT token
                                   │
                                   │ SELECT * FROM users
                                   ├──────────────────────►
                                   │◄──────────────────────┤
                                   │ User data
                                   │
   ◄──────────────────────────────┤
   { token: "jwt..." }


2. CREATE JOB
   POST /api/jobs
   Headers: { Authorization: "Bearer jwt..." }
   Body: { companyName, jobTitle, ... }
                                   │
                                   ▼
                            Verify JWT token
                            Extract userId
                                   │
                                   │ INSERT INTO jobs
                                   ├──────────────────────►
                                   │◄──────────────────────┤
                                   │ Job created
                                   │
   ◄──────────────────────────────┤
   { id, companyName, ... }


3. GET JOBS
   GET /api/jobs
   Headers: { Authorization: "Bearer jwt..." }
                                   │
                                   ▼
                            Verify JWT token
                            Extract userId
                                   │
                                   │ SELECT * FROM jobs
                                   │ WHERE userId = ?
                                   ├──────────────────────►
                                   │◄──────────────────────┤
                                   │ Jobs array
                                   │
   ◄──────────────────────────────┤
   { jobs: [...] }
```

---

## Component Lifecycle

```
EXTENSION INSTALLATION
│
├─► manifest.json loaded
│   ├─► Permissions requested
│   ├─► Icons registered
│   └─► Content scripts registered
│
├─► background.js starts
│   ├─► Service worker initialized
│   ├─► Event listeners attached
│   └─► Waiting for messages
│
└─► Extension icon appears in toolbar


USER VISITS LINKEDIN
│
├─► Content script injected
│   ├─► content.js runs
│   ├─► Event listeners attached
│   └─► Waiting for button clicks
│
└─► Extension is active on page


USER CLICKS EXTENSION ICON
│
├─► popup.html opens
│   ├─► popup.js runs
│   ├─► Checks for pending jobs
│   ├─► Loads configuration
│   └─► Shows UI
│
└─► User interacts with popup


USER CLICKS "APPLY" ON LINKEDIN
│
├─► content.js detects click
│   ├─► Extracts job data
│   ├─► Saves to storage (if external)
│   └─► Sends message to background
│
├─► background.js receives message
│   ├─► Makes API call
│   ├─► Shows notification
│   └─► Sends response
│
└─► content.js shows on-page notification
```

---

## Error Handling Flow

```
TRY TO SAVE JOB
│
├─► Check if logged in
│   ├─► NO → Show "Please login" error
│   └─► YES → Continue
│
├─► Check network connection
│   ├─► OFFLINE → Show "No internet" error
│   └─► ONLINE → Continue
│
├─► Make API request
│   ├─► 401 Unauthorized → Show "Session expired"
│   ├─► 500 Server Error → Show "Server error"
│   ├─► Network Error → Show "Connection failed"
│   └─► 200 Success → Continue
│
├─► Parse response
│   ├─► Invalid JSON → Show "Invalid response"
│   └─► Valid JSON → Continue
│
└─► Show success notification
```

This visual guide should help you understand how all the pieces fit together!
