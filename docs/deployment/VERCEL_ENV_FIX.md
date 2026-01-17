# Fix: chrome-extension://invalid/ Error

## Problem
Your frontend is showing this error:
```
GET chrome-extension://invalid/ net::ERR_FAILED
```

This happens because the `NEXT_PUBLIC_API_URL` environment variable is **not set in Vercel**.

## Root Cause
When `process.env.NEXT_PUBLIC_API_URL` is undefined in production, Next.js has a quirk where it resolves to `chrome-extension://invalid/` instead of using the fallback value.

## Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your `job-tracker-web` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add the Environment Variable
Add this variable:

**Key:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://humorous-solace-production.up.railway.app`  
**Environment:** Production, Preview, Development (check all)

### Step 3: Redeploy
After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

OR simply push a new commit to trigger a deployment.

## Verification
After redeployment, open your browser console on the deployed site. You should see API calls going to:
```
https://humorous-solace-production.up.railway.app/api/...
```

Instead of:
```
chrome-extension://invalid/api/...
```

## Alternative: Hardcode the URL (Not Recommended)
If you want a quick fix without using environment variables, you can hardcode the URL in `lib/api.ts`:

```typescript
const API_BASE = "https://humorous-solace-production.up.railway.app";
```

But this is **not recommended** because:
- You lose flexibility between environments
- You can't easily change the backend URL
- It's not following best practices

## Why This Happens
Next.js environment variables must be:
1. Prefixed with `NEXT_PUBLIC_` to be available in the browser
2. Set at **build time** (not runtime)
3. Configured in Vercel's dashboard for production deployments

The `.env.production` file in your repo is only used for local production builds, not for Vercel deployments.
