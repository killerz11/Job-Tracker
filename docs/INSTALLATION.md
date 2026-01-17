# Installation Guide

Complete guide to setting up JobTracker locally.

## Prerequisites

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: v14 or higher ([Download](https://www.postgresql.org/download/))
- **Chrome Browser**: Latest version
- **Git**: For cloning the repository

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

## Step 2: Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
```bash
psql -U postgres
CREATE DATABASE jobtracker;
\q
```

3. Note your connection string:
```
postgresql://postgres:password@localhost:5432/jobtracker
```

### Option B: Cloud Database (Recommended)

Use a managed PostgreSQL service:
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier available
- [Railway](https://railway.app) - Free tier available

## Step 3: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=4000
```

Run migrations:
```bash
npx prisma migrate deploy
```

Start backend:
```bash
npm run dev
```

Backend should be running at `http://localhost:4000`

## Step 4: Web Dashboard Setup

```bash
cd job-tracker-web
npm install
```

Create `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start dashboard:
```bash
npm run dev
```

Dashboard should be running at `http://localhost:3000`

## Step 5: Extension Setup

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension` folder from your project
5. The extension should now appear in your extensions list

### Configure Extension

1. Click the JobTracker extension icon
2. If using local backend, you'll need to modify the hardcoded URLs (see Configuration below)
3. Register a new account or login

## Step 6: Create Your First Account

1. Open the dashboard at `http://localhost:3000`
2. Click "Register"
3. Enter email and password
4. Login with your credentials
5. Click the extension icon and login there too

## Configuration

### Using Local Backend with Extension

The extension currently has hardcoded production URLs. For local development:

1. Open `extension/popup.js`
2. Change lines 3-4:
```javascript
const BACKEND_URL = "http://localhost:4000";
const DASHBOARD_URL = "http://localhost:3000";
```

3. Open `extension/background.js`
4. Change line 72:
```javascript
const baseUrl = apiUrl || "http://localhost:4000";
```

5. Reload the extension in `chrome://extensions/`

**Note**: We're working on making this configurable via settings. See [Issue #X](link).

## Verification

### Test Backend
```bash
curl http://localhost:4000/api/health
# Should return: {"status":"ok"}
```

### Test Dashboard
Open `http://localhost:3000` - you should see the login page

### Test Extension
1. Go to LinkedIn jobs page
2. Click on any job
3. Click "Easy Apply"
4. Extension should detect it (check console logs)

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Verify DATABASE_URL in `.env`
- Check port 4000 isn't in use: `lsof -i :4000`

### Dashboard won't start
- Check backend is running first
- Verify NEXT_PUBLIC_API_URL in `.env.local`
- Check port 3000 isn't in use: `lsof -i :3000`

### Extension not working
- Check extension is loaded in `chrome://extensions/`
- Check for errors in extension console (click "Inspect views: service worker")
- Verify you're on a supported site (LinkedIn or Naukri)
- Check browser console for errors (F12)

### Database connection errors
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check firewall/network settings

## Next Steps

- [Configuration Guide](CONFIGURATION.md)
- [API Documentation](API.md)
- [Deployment Guide](deployment/)

## Need Help?

- [GitHub Issues](https://github.com/yourusername/job-tracker/issues)
- [Troubleshooting Docs](troubleshooting/)
