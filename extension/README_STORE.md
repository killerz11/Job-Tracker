# JobTracker - LinkedIn Application Tracker

## Description
Never lose track of your job applications again! JobTracker automatically tracks your LinkedIn job applications and syncs them to your personal dashboard.

## Features
✅ **Automatic Tracking**: Detects both Easy Apply and External Apply on LinkedIn
✅ **Pending Queue**: Saves external applications for later confirmation
✅ **Personal Dashboard**: Sync with your own backend and web dashboard
✅ **Status Management**: Track application status (Applied, Interview, Offer, Rejected)
✅ **Privacy First**: Your data stays on YOUR server, not ours

## How It Works
1. **Install the Extension**: Add JobTracker to Chrome
2. **Configure Your Backend**: Enter your backend API URL in settings
3. **Login**: Authenticate with your account
4. **Apply to Jobs**: Browse LinkedIn and apply as usual
5. **Auto-Track**: Extension automatically captures application details
6. **View Dashboard**: Open your dashboard to see all tracked applications

## Setup Requirements
This extension requires you to set up your own backend server. We provide:
- Backend API code (Node.js + Express + Prisma)
- Frontend dashboard (Next.js)
- Complete documentation

**GitHub Repository**: [Your GitHub URL]

## For Easy Apply
- Click "Easy Apply" on LinkedIn
- Fill out the application form
- Click "Submit"
- Extension automatically tracks the application ✅

## For External Apply
- Click "Apply" button on LinkedIn
- Extension saves the job details
- Complete application on company website
- Return and confirm via extension popup
- Application is tracked ✅

## Privacy & Security
- All data is stored on YOUR server
- We don't collect or store any user data
- Open source - audit the code yourself
- JWT authentication for secure API access

## Support
- Documentation: [Your Docs URL]
- Issues: [Your GitHub Issues URL]
- Email: [Your Support Email]

## Screenshots
[You'll need to add 5 screenshots for Chrome Web Store]
1. Extension popup with login
2. Pending jobs list
3. Dashboard with tracked applications
4. LinkedIn page with tracking notification
5. Configuration settings

## Permissions Explained
- **storage**: Save your settings and pending applications locally
- **notifications**: Show success/error notifications
- **host_permissions**: Access LinkedIn to detect applications and your backend API

## Version History
### v1.0.0 (Initial Release)
- Easy Apply tracking
- External Apply tracking with confirmation
- Multiple pending jobs support
- Dashboard integration
- Status management
