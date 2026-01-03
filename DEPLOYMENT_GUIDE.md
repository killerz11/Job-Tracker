# JobTracker Deployment Guide

## Overview
This guide will help you deploy the JobTracker backend and frontend to production before publishing the Chrome extension.

---

## 🗄️ Database Setup (Neon PostgreSQL)

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project

### 2. Get Connection String
1. In Neon dashboard, go to your project
2. Copy the connection string (looks like: `postgresql://user:pass@host/db?sslmode=require`)
3. Save it for backend deployment

---

## 🚀 Backend Deployment (Railway)

### Option 1: Railway (Recommended)

#### 1. Prepare Backend
```bash
cd backend

# Make sure package.json has these scripts:
# "start": "node dist/index.js"
# "build": "tsc"
```

#### 2. Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Select `backend` folder as root directory

#### 3. Configure Environment Variables
In Railway dashboard, add:
```env
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=production
PORT=4000
```

#### 4. Configure Build Settings
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

#### 5. Run Database Migration
In Railway terminal:
```bash
npx prisma migrate deploy
```

#### 6. Get Your Backend URL
Railway will provide a URL like: `https://your-app.railway.app`

### Option 2: Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Same as Railway

---

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
cd job-tracker-web

# Create .env.production file
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app" > .env.production
```

### 2. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `job-tracker-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Environment Variables
Add in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### 4. Get Your Frontend URL
Vercel will provide a URL like: `https://your-app.vercel.app`

---

## 🔧 Backend CORS Configuration

Update `backend/src/app.ts` to allow your frontend domain:

```typescript
import express from "express";
import cors from "cors";

const app = express();

// Update CORS for production
const allowedOrigins = [
  "https://your-app.vercel.app",
  "http://localhost:3000", // Keep for local development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

export default app;
```

Redeploy backend after this change.

---

## 🧪 Testing Production Setup

### 1. Test Backend API
```bash
# Health check
curl https://your-backend-url.railway.app/api/health

# Should return: {"status":"ok"}
```

### 2. Test Frontend
1. Open `https://your-app.vercel.app`
2. Go to `/register` and create an account
3. Login at `/login`
4. Check if dashboard loads at `/dashboard`

### 3. Test Extension with Production
1. Open extension popup
2. Enter your production URLs:
   - Backend API: `https://your-backend-url.railway.app`
   - Dashboard: `https://your-app.vercel.app`
3. Click "Save Configuration"
4. Login with your credentials
5. Test tracking a job on LinkedIn

---

## 📦 Extension Packaging

### 1. Convert Icons to PNG
Your icons are currently JPG. Chrome Web Store requires PNG.

```bash
cd extension/icons

# Use an online converter or ImageMagick:
convert icon16.jpg icon16.png
convert icon32.jpg icon32.png
convert icon48.jpg icon48.png
convert icon128.jpg icon128.png

# Or use an online tool like:
# https://cloudconvert.com/jpg-to-png
```

### 2. Update Manifest
Already done! The manifest now references `.png` files.

### 3. Create ZIP File
```bash
cd extension

# Create production-ready ZIP
zip -r jobtracker-v1.0.0.zip \
  manifest.json \
  popup.html \
  popup.js \
  content.js \
  background.js \
  icons/*.png \
  PRIVACY_POLICY.md \
  README_STORE.md

# Verify contents
unzip -l jobtracker-v1.0.0.zip
```

---

## 📸 Create Screenshots

Take these screenshots for Chrome Web Store:

### 1. Extension Popup - Login (1280x800)
- Open extension popup
- Show login form
- Clean, professional look

### 2. Pending Jobs List (1280x800)
- Show popup with 2-3 pending jobs
- Highlight the confirmation buttons

### 3. Dashboard View (1280x800)
- Open your dashboard
- Show table with several tracked jobs
- Show filters and stats

### 4. LinkedIn Tracking Notification (1280x800)
- LinkedIn job page
- Show the blue notification after clicking "Apply"

### 5. Configuration Settings (1280x800)
- Extension popup showing configuration section
- Both URL fields filled in

**Tools for Screenshots**:
- Use Chrome DevTools device toolbar for consistent sizing
- Use Snagit, Lightshot, or built-in screenshot tools
- Ensure high quality (PNG format)

---

## 🔐 Privacy Policy Hosting

### Option 1: GitHub Pages
1. Create a new repository: `jobtracker-privacy`
2. Add `PRIVACY_POLICY.md` as `index.md`
3. Enable GitHub Pages in settings
4. Get URL: `https://yourusername.github.io/jobtracker-privacy`

### Option 2: Host on Your Domain
1. Upload `PRIVACY_POLICY.md` to your website
2. Convert to HTML or use markdown renderer
3. Make it accessible at: `https://yourdomain.com/privacy`

### Update Manifest (Optional)
```json
{
  "homepage_url": "https://github.com/yourusername/jobtracker",
  "privacy_policy": "https://yourdomain.com/privacy"
}
```

---

## 📋 Pre-Submission Checklist

### Backend
- [ ] Deployed to Railway/Render
- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] CORS configured for frontend domain
- [ ] Health endpoint returns 200 OK
- [ ] Can register and login via API

### Frontend
- [ ] Deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] Can access all pages
- [ ] Can login and view dashboard
- [ ] API calls work correctly

### Extension
- [ ] Icons converted to PNG format
- [ ] Manifest updated with production-ready settings
- [ ] Tested with production backend URL
- [ ] All features work (Easy Apply, External Apply)
- [ ] No console errors
- [ ] Privacy policy hosted publicly
- [ ] ZIP file created

### Store Listing
- [ ] 5 screenshots created (1280x800 PNG)
- [ ] Store description written
- [ ] Privacy policy URL ready
- [ ] Support email set up
- [ ] Developer account created ($5 fee paid)

---

## 🚀 Chrome Web Store Submission

### 1. Go to Developer Dashboard
https://chrome.google.com/webstore/devconsole

### 2. Create New Item
- Click "New Item"
- Upload your ZIP file
- Wait for upload to complete

### 3. Fill Store Listing
- **Name**: JobTracker - LinkedIn Application Tracker
- **Summary**: Track LinkedIn job applications automatically
- **Description**: Use content from `extension/README_STORE.md`
- **Category**: Productivity
- **Language**: English

### 4. Upload Assets
- Upload 5 screenshots
- Upload small promo tile (440x280) - optional
- Upload marquee promo tile (1400x560) - optional

### 5. Privacy Practices
- Declare what data you collect
- Add privacy policy URL
- Explain permissions

### 6. Distribution
- **Visibility**: Public
- **Regions**: All regions
- **Pricing**: Free

### 7. Submit for Review
- Review all information
- Click "Submit for Review"
- Wait 1-3 business days

---

## 📊 Post-Launch

### Monitor
- Check Chrome Web Store reviews
- Monitor error reports
- Track user feedback

### Support
- Set up support email
- Create FAQ document
- Monitor GitHub issues

### Updates
- Fix bugs promptly
- Add new features based on feedback
- Keep documentation updated

---

## 🆘 Troubleshooting

### Backend Issues
**Problem**: Database connection fails
- Check DATABASE_URL is correct
- Ensure SSL mode is enabled for Neon
- Run `npx prisma generate` after deployment

**Problem**: CORS errors
- Add frontend domain to allowed origins
- Redeploy backend
- Clear browser cache

### Frontend Issues
**Problem**: API calls fail
- Check NEXT_PUBLIC_API_URL is set correctly
- Ensure backend is running
- Check browser console for errors

### Extension Issues
**Problem**: Can't connect to backend
- Verify backend URL in extension settings
- Check backend is accessible (curl test)
- Check browser console for errors

**Problem**: Jobs not tracking
- Check content script is loading on LinkedIn
- Verify button detection logic
- Check background script logs

---

## 📞 Support Resources

### Deployment Platforms
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs

### Chrome Web Store
- Developer Dashboard: https://chrome.google.com/webstore/devconsole
- Documentation: https://developer.chrome.com/docs/webstore
- Program Policies: https://developer.chrome.com/docs/webstore/program-policies

---

**Good luck with your deployment! 🎉**
