# CodeLens Backend

This is the backend server for CodeLens, an AI-powered interactive documentation generator.

## Architecture

The backend is built with:
- **Node.js 20+** with ES Modules
- **Express** for the REST API
- **TypeScript** for type safety
- **Babel** for AST parsing and code analysis

## Project Structure

```
src/server/
├── analyzers/          # Code analyzers for different languages
│   ├── BaseAnalyzer.ts       # Abstract base class
│   └── TypeScriptAnalyzer.ts # TypeScript/JavaScript analyzer
├── controllers/        # Request handlers
│   ├── AnalyzeController.ts  # Analysis endpoints
│   └── CacheController.ts    # Cache management
├── middleware/         # Express middleware
│   ├── errorHandler.ts       # Global error handling
│   └── notFoundHandler.ts    # 404 handler
├── routes/            # API routes
│   ├── index.ts             # Main router
│   ├── analyze.ts           # Analysis routes
│   └── cache.ts             # Cache routes
└── index.ts           # Server entry point
```

## API Endpoints

### Analysis

- `POST /api/v1/analyze/file` - Analyze a single file
- `POST /api/v1/analyze/directory` - Analyze all files in a directory
- `POST /api/v1/analyze/project` - Analyze an entire project
- `GET /api/v1/analyze/status/:id` - Get analysis status

### Cache Management

- `GET /api/v1/cache/stats` - Get cache statistics
- `DELETE /api/v1/cache/clear` - Clear all caches
- `DELETE /api/v1/cache/:key` - Delete specific cache entry

### Health Check

- `GET /health` - Server health status

## Features

### Code Analysis
- **AST-based parsing** using Babel
- **Multi-language support** (TypeScript, JavaScript)
- **Complexity metrics** (cyclomatic, cognitive, maintainability index)
- **Dependency tracking**
- **Documentation extraction** from JSDoc comments

### Caching
- **Three-tier caching** (analysis, file, documentation)
- **Automatic cache invalidation**
- **Cache statistics and monitoring**
- **Configurable TTL and size limits**

### Error Handling
- **Structured error responses**
- **Comprehensive logging** with Winston
- **Graceful error recovery**

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:coverage
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
CACHE_TTL=3600
CACHE_MAX_SIZE=100
MAX_FILE_SIZE=10485760
```

## Code Analysis Example

```typescript
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';

const analyzer = new TypeScriptAnalyzer({
  includePrivate: true,
  includeTests: false,
  maxFileSize: 10485760,
});

const content = await readFile('example.ts');
const result = await analyzer.analyzeFile('example.ts', content);

console.log(result.functions);  // All functions found
console.log(result.classes);    // All classes found
console.log(result.complexity); // Complexity metrics
```

## Adding New Language Analyzers

To add support for a new language:

1. Create a new analyzer class extending `BaseAnalyzer`
2. Implement the required methods:
   - `analyzeFile(filePath, content)`
   - `getSupportedExtensions()`
3. Register the analyzer in the controller

Example:

```typescript
export class PythonAnalyzer extends BaseAnalyzer {
  constructor(options: AnalyzerOptions = {}) {
    super('python', options);
  }

  getSupportedExtensions(): string[] {
    return ['.py'];
  }

  async analyzeFile(filePath: string, content: string): Promise<AnalysisResult> {
    // Implementation here
  }
}
```

## Performance

- **Caching**: Results are cached to avoid re-analyzing unchanged files
- **Batch processing**: Large projects are analyzed in batches
- **Async operations**: All I/O operations are asynchronous
- **Memory efficient**: Streaming for large files

## Security

- **Helmet.js**: Security headers
- **CORS**: Configurable origin restrictions
- **Input validation**: All inputs are validated
- **Error sanitization**: Stack traces hidden in production

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

## Next Steps

- [ ] Add Python analyzer
- [ ] Implement WebSocket for real-time updates
- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Add metrics and monitoring