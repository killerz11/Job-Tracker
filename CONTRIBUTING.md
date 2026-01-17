# Contributing to JobTracker

Thanks for your interest in contributing! This document provides guidelines for contributing to JobTracker.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/job-tracker.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "feat: add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Setup

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for detailed setup instructions.

## 🎯 What to Contribute

### High Priority
- [ ] Add tests (unit, integration, e2e)
- [ ] Improve error handling and retry logic
- [ ] Add more job platforms (Indeed, Glassdoor)
- [ ] Better LinkedIn selector resilience
- [ ] Token refresh mechanism

### Medium Priority
- [ ] Dashboard search and filters
- [ ] Export to CSV
- [ ] Application analytics
- [ ] Email notifications
- [ ] Dark mode

### Low Priority
- [ ] Mobile app
- [ ] Browser extension for Firefox
- [ ] AI-powered application insights

## 💻 Code Style

- **TypeScript**: Use strict mode, avoid `any`
- **JavaScript**: Use modern ES6+ syntax
- **Formatting**: Run `npm run lint` before committing
- **Naming**: Use descriptive variable names
- **Comments**: Explain "why", not "what"

## 🧪 Testing

Before submitting a PR:
1. Test the extension on LinkedIn and Naukri
2. Test both Easy Apply and External Apply flows
3. Test the dashboard with various data states
4. Check console for errors
5. Verify API endpoints work correctly

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add Indeed platform support
fix: handle LinkedIn layout changes
docs: update installation guide
refactor: extract job extraction logic
```

## 🐛 Bug Reports

When reporting bugs, include:
- Browser version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## 💡 Feature Requests

When requesting features:
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternative solutions
- Note any breaking changes

## 🔍 Code Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PRs focused and small
4. Update documentation if needed
5. Ensure CI passes

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

Open a [GitHub Discussion](https://github.com/yourusername/job-tracker/discussions) or comment on an existing issue.
