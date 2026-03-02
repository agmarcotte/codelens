# Getting Started with CodeLens

This guide will help you set up and start using CodeLens for your documentation needs.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0 or higher ([Download](https://nodejs.org/))
- **npm** 10.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Verify Installation

```bash
node --version  # Should be v20.0.0 or higher
npm --version   # Should be 10.0.0 or higher
git --version   # Any recent version
```

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd codelens
```

### 2. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm install
```

This will install dependencies for both the backend and frontend projects.

### 3. Start Development Servers

```bash
# Start both backend and frontend in development mode
npm run dev
```

This command will:
- Start the backend API server on `http://localhost:3001`
- Start the frontend development server on `http://localhost:5173`
- Open your browser automatically

### 4. Verify Installation

Open your browser and navigate to `http://localhost:5173`. You should see the CodeLens home page.

---

## 📁 Project Structure Overview

```
codelens/
├── backend/          # Node.js + Express API
│   ├── src/         # Source code
│   └── tests/       # Backend tests
├── frontend/        # React + TypeScript UI
│   ├── src/         # Source code
│   └── tests/       # Frontend tests
├── docs/            # Documentation
└── scripts/         # Build and utility scripts
```

---

## 🔧 Development Commands

### Backend Commands

```bash
# Start backend server only
cd backend
npm run dev

# Run backend tests
npm test

# Run backend tests in watch mode
npm run test:watch

# Build backend for production
npm run build

# Start production server
npm start
```

### Frontend Commands

```bash
# Start frontend dev server only
cd frontend
npm run dev

# Run frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Root Commands

```bash
# Start both servers
npm run dev

# Run all tests
npm test

# Build everything
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

---

## 🎯 Your First Documentation

### Using the Web Interface

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Open the browser** at `http://localhost:5173`

3. **Select a project**
   - Click "Analyze Project"
   - Browse to your project directory
   - Click "Start Analysis"

4. **View documentation**
   - Browse generated documentation
   - Explore code examples
   - View architecture diagrams

5. **Export documentation**
   - Click "Export" button
   - Choose format (HTML, PDF, Markdown)
   - Download your documentation

### Using the API

```bash
# Analyze a project
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/path/to/your/project",
    "options": {
      "languages": ["typescript", "javascript"]
    }
  }'

# Generate documentation
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "your-analysis-id",
    "format": "html"
  }'
```

---

## 🧪 Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suites

```bash
# Backend unit tests
npm run test:backend

# Frontend unit tests
npm run test:frontend

# End-to-end tests
npm run test:e2e

# With coverage report
npm run test:coverage
```

### Writing Tests

Tests are located in:
- Backend: `backend/tests/`
- Frontend: `frontend/tests/`

Example test:
```typescript
import { describe, it, expect } from 'vitest';
import { TypeScriptAnalyzer } from '../src/analyzers/typescript.analyzer';

describe('TypeScriptAnalyzer', () => {
  it('should analyze TypeScript code', () => {
    const analyzer = new TypeScriptAnalyzer();
    const result = analyzer.analyze('const x = 1;');
    expect(result).toBeDefined();
  });
});
```

---

## 🎨 Customization

### Configuration Files

- **Backend**: `backend/.env` - API configuration
- **Frontend**: `frontend/.env` - UI configuration
- **Tailwind**: `frontend/tailwind.config.js` - Styling
- **TypeScript**: `tsconfig.json` - Type checking

### Environment Variables

Create `.env` files in backend and frontend directories:

**backend/.env**
```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
CACHE_ENABLED=true
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=CodeLens
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you see "Port 3001 already in use":
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
npm run clean
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript
npm install -D typescript@latest
```

---

## 📚 Next Steps

1. **Read the Architecture Guide** - [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)
2. **Explore the API** - [`docs/API.md`](API.md)
3. **Learn to Contribute** - [`docs/CONTRIBUTING.md`](CONTRIBUTING.md)
4. **Try Examples** - Check out example projects in `examples/`

---

## 🆘 Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: [GitHub Issues](https://github.com/yourusername/codelens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/codelens/discussions)

---

## 🎓 Learning Resources

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### React
- [React Documentation](https://react.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Node.js
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

---

**Happy documenting! 🚀**