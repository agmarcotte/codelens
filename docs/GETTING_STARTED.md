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
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 3. Start Development Servers

```bash
# Start both backend and frontend with one command
npm run dev
```

This command will:
- Start the backend API server on `http://localhost:3000`
- Start the frontend development server on `http://localhost:5173`
- Display color-coded logs (blue for backend, green for frontend)

**Alternative - Run separately:**
```bash
# Terminal 1 - Backend only
npm run dev:server

# Terminal 2 - Frontend only
npm run dev:client
```

### 4. Verify Installation

Open your browser and navigate to `http://localhost:5173`. You should see the CodeLens home page.

---

## 📁 Project Structure Overview

```
codelens/
├── src/              # Backend source code
│   ├── server/      # Express API server
│   ├── shared/      # Shared types
│   └── utils/       # Utility functions
├── client/          # React + TypeScript frontend
│   ├── src/         # Frontend source code
│   └── public/      # Static assets
├── docs/            # Documentation
├── e2e/             # End-to-end tests
└── dist/            # Build output
```

---

## 🔧 Development Commands

### Main Commands (Root Directory)

```bash
# Start both servers (recommended)
npm run dev

# Start backend only
npm run dev:server

# Start frontend only
npm run dev:client

# Build backend
npm run build

# Build both backend and frontend
npm run build:all

# Run backend tests
npm test

# Run all tests (backend + frontend + e2e)
npm run test:all

# Run linting
npm run lint

# Format code
npm run format
```

### Backend Commands

```bash
# From root directory
npm run dev:server      # Start backend server
npm test                # Run backend tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run build           # Build for production
npm start               # Start production server
```

### Frontend Commands

```bash
# From client directory
cd client
npm run dev             # Start dev server
npm test                # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
npm run build           # Build for production
npm run preview         # Preview production build
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
# Health check
curl http://localhost:3000/health

# Analyze a file
curl -X POST http://localhost:3000/api/v1/analyze/file \
  -H "Content-Type: application/json" \
  -d '{
    "path": "./src/server/index.ts"
  }'

# Get cache stats
curl http://localhost:3000/api/v1/cache/stats

# Clear cache
curl -X DELETE http://localhost:3000/api/v1/cache
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

- **Backend**: `.env` - API configuration (root directory)
- **Frontend**: `client/.env` - UI configuration
- **Tailwind**: `client/tailwind.config.js` - Styling
- **TypeScript**: `tsconfig.json` - Type checking
- **Jest**: `jest.config.js` - Backend testing
- **Vitest**: `client/vitest.config.ts` - Frontend testing

### Environment Variables

Create `.env` files:

**Root .env (Backend)**
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
CACHE_MAX_SIZE=104857600
CACHE_TTL=3600000
```

**client/.env (Frontend)**
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Port Already in Use

If you see "Port 3000 already in use" or "Port 5173 already in use":
```bash
# Find and kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill the process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different ports
PORT=3002 npm run dev:server
```

### Module Not Found

```bash
# Clear and reinstall backend dependencies
rm -rf node_modules package-lock.json
npm install

# Clear and reinstall frontend dependencies
cd client
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Build Errors

```bash
# Backend build
npm run build

# Frontend build
cd client && npm run build

# Both
npm run build:all
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Check frontend TypeScript
cd client && npx tsc --noEmit
```

### Security Vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities (backend)
npm audit fix

# Check frontend
cd client && npm audit

# Fix frontend vulnerabilities
cd client && npm audit fix
```

### Tailwind CSS Issues

If you see Tailwind CSS errors:
```bash
# Ensure @tailwindcss/postcss is installed
cd client
npm install @tailwindcss/postcss
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