# Performance Optimization Guide

## Overview
This document outlines all performance optimizations implemented in the CodeLens project to ensure fast load times, smooth interactions, and efficient resource usage.

## Frontend Optimizations

### 1. Build Optimizations

#### Code Splitting
**File**: `client/vite.config.performance.ts`

**Manual Chunk Strategy**:
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['framer-motion', 'lucide-react'],
  'editor-vendor': ['@monaco-editor/react', 'monaco-editor'],
  'state-vendor': ['zustand', '@tanstack/react-query'],
  'utils-vendor': ['axios', 'mermaid'],
}
```

**Benefits**:
- ✅ Separate vendor code from application code
- ✅ Better browser caching (vendors change less frequently)
- ✅ Parallel loading of chunks
- ✅ Reduced initial bundle size

#### Minification
- **Tool**: esbuild (faster than terser)
- **Drops**: console.log, debugger statements in production
- **Minifies**: identifiers, syntax, whitespace

#### Asset Optimization
- **Images**: Organized in `assets/images/` with hash names
- **Fonts**: Organized in `assets/fonts/` with hash names
- **Inline Threshold**: 10KB (smaller assets inlined as base64)

### 2. Lazy Loading

#### Route-Based Code Splitting
```typescript
// Lazy load route components
const AnalyzeView = lazy(() => import('./components/views/AnalyzeView'));
const DocumentationView = lazy(() => import('./components/views/DocumentationView'));
const PlaygroundView = lazy(() => import('./components/views/PlaygroundView'));
```

**Benefits**:
- ✅ Load only what's needed for current route
- ✅ Faster initial page load
- ✅ Reduced JavaScript bundle size

#### Component-Level Lazy Loading
```typescript
// Lazy load heavy components
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
const MermaidDiagram = lazy(() => import('./components/diagrams/DiagramRenderer'));
```

### 3. Caching Strategy

#### Browser Caching
- **Static Assets**: Long-term caching with hash-based filenames
- **HTML**: No caching (always fresh)
- **API Responses**: Cached with React Query

#### Service Worker (Future Enhancement)
```typescript
// Cache strategies
- Network First: API calls
- Cache First: Static assets
- Stale While Revalidate: Images
```

### 4. Image Optimization

#### Best Practices
```typescript
// Use modern formats
- WebP for photos
- SVG for icons and logos
- PNG for transparency

// Responsive images
<img 
  srcSet="image-320w.webp 320w, image-640w.webp 640w"
  sizes="(max-width: 600px) 320px, 640px"
  loading="lazy"
/>
```

#### Lazy Loading Images
```typescript
<img loading="lazy" alt="Description" />
```

### 5. CSS Optimization

#### Tailwind CSS Purging
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Removes unused CSS in production
}
```

**Result**: ~90% reduction in CSS file size

#### CSS Code Splitting
- Each route gets its own CSS chunk
- Critical CSS inlined in HTML
- Non-critical CSS loaded asynchronously

### 6. JavaScript Optimization

#### Tree Shaking
- Removes unused code during build
- Works with ES modules
- Reduces bundle size by 20-30%

#### Dead Code Elimination
```typescript
// Development only code removed in production
if (process.env.NODE_ENV === 'development') {
  // Debug code here
}
```

### 7. State Management Optimization

#### Zustand Performance
```typescript
// Selective subscriptions (only re-render when needed)
const theme = useAppStore(state => state.theme);

// Avoid full store subscriptions
// ❌ const store = useAppStore();
// ✅ const theme = useAppStore(state => state.theme);
```

#### React Query Caching
```typescript
// Automatic caching and background refetching
const { data } = useQuery({
  queryKey: ['analysis', filePath],
  queryFn: () => apiService.analyzeFile(filePath),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 8. Animation Performance

#### Framer Motion Optimization
```typescript
// Use transform and opacity (GPU accelerated)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  // ✅ Uses transform (fast)
/>

// Avoid animating layout properties
// ❌ width, height, top, left (slow)
// ✅ transform, opacity (fast)
```

#### CSS Animations
```css
/* Use will-change for complex animations */
.animated-element {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.animated-element.done {
  will-change: auto;
}
```

### 9. Network Optimization

#### API Request Optimization
```typescript
// Debounce search inputs
const debouncedSearch = useMemo(
  () => debounce((value) => search(value), 300),
  []
);

// Cancel pending requests
const abortController = new AbortController();
fetch(url, { signal: abortController.signal });
```

#### Compression
- **Gzip**: Enabled on server
- **Brotli**: Preferred when available
- **Result**: 70-80% size reduction

### 10. Rendering Optimization

#### React Performance
```typescript
// Memoization
const MemoizedComponent = memo(Component);

// useMemo for expensive calculations
const expensiveValue = useMemo(() => 
  computeExpensiveValue(a, b), 
  [a, b]
);

// useCallback for function references
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### Virtual Scrolling (Future Enhancement)
```typescript
// For large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={35}
>
  {Row}
</FixedSizeList>
```

## Backend Optimizations

### 1. Caching System

#### Three-Tier Cache
```typescript
// Analysis cache
analysisCache.set(filePath, result, { ttl: 3600 });

// File cache
fileCache.set(filePath, content, { ttl: 1800 });

// Documentation cache
docCache.set(key, documentation, { ttl: 7200 });
```

**Benefits**:
- ✅ Reduces file system reads
- ✅ Faster analysis results
- ✅ Lower CPU usage

### 2. Async Processing

#### Parallel Analysis
```typescript
// Analyze multiple files in parallel
const results = await Promise.all(
  files.map(file => analyzeFile(file))
);
```

#### Batch Processing
```typescript
// Process in batches to avoid memory issues
const batchSize = 10;
for (let i = 0; i < files.length; i += batchSize) {
  const batch = files.slice(i, i + batchSize);
  await processBatch(batch);
}
```

### 3. Database Optimization (Future)

#### Indexing
```sql
CREATE INDEX idx_file_path ON analysis_results(file_path);
CREATE INDEX idx_timestamp ON analysis_results(timestamp);
```

#### Query Optimization
```typescript
// Use projections (select only needed fields)
db.find({ filePath }, { projection: { result: 1, timestamp: 1 } });

// Use pagination
db.find().limit(20).skip(page * 20);
```

### 4. API Response Optimization

#### Compression
```typescript
// Enable gzip compression
app.use(compression());
```

#### Response Streaming
```typescript
// Stream large responses
res.setHeader('Content-Type', 'application/json');
res.write('[');
for (const item of items) {
  res.write(JSON.stringify(item) + ',');
}
res.write(']');
res.end();
```

## Performance Metrics

### Target Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Bundle Size Targets
- **Initial Bundle**: < 200KB (gzipped)
- **Vendor Chunks**: < 150KB each (gzipped)
- **Route Chunks**: < 50KB each (gzipped)
- **Total Bundle**: < 500KB (gzipped)

### API Response Times
- **Simple Queries**: < 100ms
- **File Analysis**: < 500ms
- **Directory Analysis**: < 2s
- **Documentation Generation**: < 1s

## Monitoring & Measurement

### Tools

#### Lighthouse
```bash
# Run Lighthouse audit
npm run lighthouse

# Target scores
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
```

#### Bundle Analyzer
```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for:
- Large dependencies
- Duplicate code
- Unused exports
```

#### Performance API
```typescript
// Measure component render time
const start = performance.now();
// Component render
const end = performance.now();
console.log(`Render time: ${end - start}ms`);
```

### Chrome DevTools

#### Performance Tab
1. Record page load
2. Analyze:
   - Loading time
   - Scripting time
   - Rendering time
   - Painting time

#### Network Tab
1. Check:
   - Request count
   - Total size
   - Load time
   - Caching

#### Coverage Tab
1. Find unused code
2. Remove or lazy load

## Best Practices Checklist

### Development
- [ ] Use React DevTools Profiler
- [ ] Monitor bundle size during development
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Use performance budgets

### Build
- [ ] Enable production mode
- [ ] Minify all assets
- [ ] Remove source maps (or external only)
- [ ] Optimize images
- [ ] Enable compression

### Deployment
- [ ] Use CDN for static assets
- [ ] Enable HTTP/2
- [ ] Set proper cache headers
- [ ] Enable Brotli compression
- [ ] Monitor real user metrics (RUM)

## Quick Wins

### Immediate Improvements
1. **Enable Compression**: 70% size reduction
2. **Add Cache Headers**: Faster repeat visits
3. **Lazy Load Images**: Faster initial load
4. **Code Splitting**: Smaller initial bundle
5. **Remove Unused CSS**: 90% CSS reduction

### Low-Hanging Fruit
1. Optimize images (WebP format)
2. Defer non-critical JavaScript
3. Preload critical resources
4. Use font-display: swap
5. Minimize third-party scripts

## Future Enhancements

### Planned Optimizations
1. **Service Worker**: Offline support and caching
2. **HTTP/3**: Faster network requests
3. **Edge Computing**: Deploy to edge locations
4. **Database Indexing**: Faster queries
5. **GraphQL**: Reduce over-fetching
6. **WebAssembly**: CPU-intensive tasks
7. **Prefetching**: Predict and preload next pages
8. **Resource Hints**: dns-prefetch, preconnect

## Performance Budget

### Limits
```json
{
  "javascript": {
    "initial": "200KB",
    "total": "500KB"
  },
  "css": {
    "initial": "50KB",
    "total": "100KB"
  },
  "images": {
    "total": "1MB"
  },
  "fonts": {
    "total": "100KB"
  }
}
```

### Enforcement
```bash
# Fail build if budget exceeded
npm run build -- --budget
```

## Summary

### Implemented Optimizations
✅ Code splitting and lazy loading
✅ Asset optimization and caching
✅ Minification and compression
✅ Tree shaking and dead code elimination
✅ CSS purging with Tailwind
✅ React performance patterns
✅ Backend caching system
✅ Async processing

### Expected Results
- **50-70% reduction** in initial bundle size
- **2-3x faster** page load times
- **90+ Lighthouse** performance score
- **Smooth 60fps** animations
- **< 100ms** API response times

### Maintenance
- Monitor bundle size regularly
- Run Lighthouse audits monthly
- Profile performance bottlenecks
- Update dependencies for performance fixes
- Review and optimize new features

---

**Performance is a feature!** Keep optimizing and measuring.