# JobTracker Extension - Installation & Setup Guide

## For End Users

### Prerequisites
Before installing the extension, you need:
1. A deployed backend API server
2. A deployed frontend dashboard
3. A registered user account

### Installation Steps

#### 1. Install Extension
1. Go to Chrome Web Store
2. Search for "JobTracker - LinkedIn Application Tracker"
3. Click "Add to Chrome"
4. Click "Add extension" in the popup

#### 2. Configure Backend
1. Click the JobTracker extension icon in Chrome toolbar
2. In the "Configuration" section:
   - Enter your **Backend API URL** (e.g., `https://api.yourdomain.com`)
   - Enter your **Dashboard URL** (e.g., `https://yourdomain.com`)
3. Click "Save Configuration"

#### 3. Login
1. Enter your email and password
2. Click "Login"
3. You should see "Status: Connected" ✅

#### 4. Start Tracking Jobs!
1. Go to LinkedIn Jobs: https://www.linkedin.com/jobs
2. Browse and apply to jobs as usual
3. The extension will automatically track your applications

---

## How to Use

### Easy Apply Jobs
1. Click "Easy Apply" on any LinkedIn job
2. Fill out the application form
3. Click "Submit application"
4. Extension automatically tracks it ✅
5. You'll see a green notification: "Job tracked successfully!"

### External Apply Jobs
1. Click "Apply" button on LinkedIn (non-Easy Apply)
2. Extension saves the job details
3. You'll see a blue notification with job info
4. Complete your application on the company's website
5. Return to LinkedIn or click the extension icon
6. Confirm "Yes, I applied" or "No, I didn't"
7. Job is saved to your dashboard ✅

### View Your Applications
1. Click extension icon
2. Click "Open Dashboard" button
3. Your dashboard opens in a new tab
4. View all tracked applications with filters and stats

---

## Troubleshooting

### "Not logged in" Status
**Solution**: 
- Make sure you entered the correct Backend API URL
- Verify your credentials are correct
- Check if your backend server is running

### Jobs Not Tracking
**Solution**:
- Ensure you're logged in (check extension popup)
- Verify backend URL is configured correctly
- Check browser console for errors (F12)
- Try reloading the LinkedIn page

### "Connection error"
**Solution**:
- Check if backend server is accessible
- Verify the URL doesn't have typos
- Ensure backend has CORS enabled for Chrome extensions

### Extension Icon Shows Badge Number
**Meaning**: You have pending external applications waiting for confirmation
**Action**: Click the extension icon to confirm or reject them

---

## Privacy & Security

### Your Data
- All data is stored on YOUR configured backend server
- We don't collect or store any user data
- Extension only communicates with LinkedIn and your backend

### Permissions
- **storage**: Save settings and pending jobs locally
- **notifications**: Show tracking success/error messages
- **LinkedIn access**: Detect when you apply to jobs

---

## Support

### Need Help?
- Email: [Your Support Email]
- GitHub Issues: [Your GitHub URL]
- Documentation: [Your Docs URL]

### Report a Bug
1. Go to GitHub Issues
2. Describe the problem
3. Include browser console logs (F12)
4. Mention which LinkedIn job page you were on

---

## Uninstallation

### Remove Extension
1. Right-click extension icon
2. Click "Remove from Chrome"
3. Confirm removal

**Note**: This will delete locally stored settings and pending jobs. Your tracked applications in the dashboard will remain.

---

## Updates

The extension will automatically update when new versions are released. You'll see a notification in Chrome.

---

**Happy job hunting! 🎯**
