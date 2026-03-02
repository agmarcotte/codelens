# CodeLens - Quick Start Guide

Get CodeLens up and running in minutes!

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For cloning the repository

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd codelens
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Start the Backend Server

```bash
# From the codelens directory
npm run dev
```

The backend API will start at `http://localhost:3000`

### 4. Start the Frontend (New Terminal)

```bash
# From the codelens directory
cd client
npm run dev
```

The frontend will start at `http://localhost:5173`

### 5. Open Your Browser

Navigate to `http://localhost:5173` and start analyzing code!

## 🎯 First Analysis

1. **Navigate to "Analyze Code"** (default view)
2. **Enter a file path**, for example:
   ```
   ./src/server/index.ts
   ```
3. **Click "Analyze"**
4. **View the results** showing functions, classes, and complexity metrics

## 📝 Generate Documentation

1. **Navigate to "Documentation"** in the sidebar
2. **Enter a project path** (optional, or use current analysis)
3. **Click "Generate Documentation"**
4. **View the markdown preview**
5. **Click "Download Markdown"** to save the file

## 💾 Check Cache

1. **Navigate to "Cache"** in the sidebar
2. **View cache statistics** (hits, misses, hit rate)
3. **Click "Refresh"** to update stats
4. **Click "Clear Cache"** to reset (with confirmation)

## ⚙️ Settings

1. **Navigate to "Settings"** in the sidebar
2. **Toggle theme** between Light and Dark mode
3. **View API endpoint** and version information

## 🔧 Configuration

### Backend Configuration

Create a `.env` file in the `codelens` directory:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
CACHE_MAX_SIZE=104857600
CACHE_TTL=3600000
```

### Frontend Configuration

The frontend `.env` file is already created at `codelens/client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 📊 Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Analyze a File
```bash
curl -X POST http://localhost:3000/api/v1/analyze/file \
  -H "Content-Type: application/json" \
  -d '{"path": "./src/server/index.ts"}'
```

### Get Cache Stats
```bash
curl http://localhost:3000/api/v1/cache/stats
```

## 🎨 Features Overview

### Code Analysis
- ✅ Single file analysis
- ✅ Directory analysis (recursive)
- ✅ Project-wide analysis
- ✅ Function extraction with complexity metrics
- ✅ Class and interface detection
- ✅ Import/export tracking

### Documentation Generation
- ✅ Comprehensive documentation from analysis
- ✅ Markdown export
- ✅ Diagram generation (Mermaid)
- ✅ Code examples extraction
- ✅ API reference generation

### Cache Management
- ✅ Three-tier caching (analysis, file, documentation)
- ✅ Hit rate tracking
- ✅ Size monitoring
- ✅ Manual cache clearing

### UI Features
- ✅ Light/Dark theme
- ✅ Responsive design
- ✅ Real-time progress
- ✅ Error handling
- ✅ Loading states

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version: `node --version`
- Try: `npm install` again

### Frontend won't start
- Check if port 5173 is available
- Verify dependencies: `cd client && npm install`
- Clear cache: `rm -rf node_modules && npm install`

### API connection errors
- Ensure backend is running at `http://localhost:3000`
- Check `.env` file in `client/` directory
- Verify CORS is enabled in backend

### Analysis fails
- Check file path is correct and accessible
- Ensure file is TypeScript or JavaScript
- Check backend logs for errors

## 📚 Next Steps

### Explore the Documentation
- Read [`README.md`](./README.md) for project overview
- Check [`PROGRESS.md`](./PROGRESS.md) for implementation details
- Review [`FRONTEND_SUMMARY.md`](./FRONTEND_SUMMARY.md) for frontend architecture
- See [`docs/`](./docs/) for detailed documentation

### Try Advanced Features
- Analyze entire directories
- Generate documentation with diagrams
- Export documentation as Markdown
- Monitor cache performance

### Development
- Review the code structure
- Check TypeScript types
- Explore the API endpoints
- Customize the UI theme

## 🎓 Learning Resources

### Backend
- Express.js documentation
- TypeScript handbook
- Babel parser documentation
- Winston logging guide

### Frontend
- React documentation
- Vite guide
- Tailwind CSS docs
- Zustand documentation

## 🤝 Contributing

Want to contribute? Check out:
- [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for guidelines
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for system design
- [`docs/API.md`](./docs/API.md) for API reference

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Need Help?

- Check the documentation in the `docs/` folder
- Review the code comments
- Open an issue on GitHub
- Contact the development team

---

**Happy Coding! 🚀**