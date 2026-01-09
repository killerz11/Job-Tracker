# JobTracker

> A privacy-first job application tracker that automatically captures your applications from LinkedIn and Naukri, syncing them to your personal dashboard.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Why JobTracker?

Job hunting is hard enough without losing track of where you've applied. JobTracker automatically captures your applications as you submit them, giving you a centralized dashboard to manage your job search.

**Key Features:**
- ✅ **Auto-tracking**: Detects Easy Apply and External Apply submissions
- 🔒 **Privacy-first**: Your data stays on YOUR server
- 📊 **Dashboard**: Track status, add notes, filter applications
- 🔔 **Smart notifications**: Never miss a pending application
- 🚀 **Self-hosted**: Full control over your data

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Chrome Extension│─────▶│ Backend API  │─────▶│  Web Dashboard  │
│   (Tracker)     │      │ (Node/Prisma)│      │   (Next.js)     │
└─────────────────┘      └──────────────┘      └─────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  PostgreSQL  │
                         └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Chrome browser

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT secret
npx prisma migrate deploy
npm run dev
```

### 3. Setup Web Dashboard
```bash
cd job-tracker-web
npm install
cp .env.example .env.local
# Edit .env.local with your backend API URL
npm run dev
```

### 4. Load Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. Click the extension icon and configure your backend URL

## 📖 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [API Documentation](docs/API.md)
- [Contributing](CONTRIBUTING.md)
- [Deployment Guide](docs/deployment/)

## 🛠️ Tech Stack

**Extension:**
- Vanilla JavaScript
- Chrome Extension Manifest V3
- Chrome Storage API

**Backend:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

## 🔒 Privacy & Security

- **Self-hosted**: You control where your data lives
- **No tracking**: We don't collect any analytics or user data
- **Open source**: Audit the code yourself
- **JWT auth**: Secure API authentication
- **Encrypted passwords**: bcrypt hashing

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/yourusername/job-tracker/issues)

## 📧 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/job-tracker/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/job-tracker/discussions)

---

**Note**: This is a self-hosted solution. You need to deploy your own backend and database. See [Deployment Guide](docs/deployment/) for instructions.
