# CodeLens Frontend

Modern React + TypeScript frontend for CodeLens code analysis tool.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Query** - Server state management (optional)

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Sidebar, MainContent)
│   │   ├── views/           # View components (AnalyzeView, DocumentationView, etc.)
│   │   ├── analysis/        # Analysis-specific components
│   │   └── ThemeProvider.tsx
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── store/
│   │   └── useAppStore.ts   # Zustand store
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your API endpoint:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

### Code Analysis
- Analyze single files or entire directories
- View functions, classes, and interfaces
- See complexity metrics
- Real-time analysis progress

### Documentation Generation
- Generate comprehensive documentation
- Export as Markdown
- Include diagrams and examples
- Download documentation files

### Cache Management
- View cache statistics
- Monitor hit rates
- Clear cache when needed
- Track cache usage

### Settings
- Light/Dark theme toggle
- View API configuration
- Application information

## 🎯 Key Components

### Layout Components
- **Header**: Top navigation with theme toggle
- **Sidebar**: Navigation menu
- **MainContent**: Main content area with view routing

### View Components
- **AnalyzeView**: Code analysis interface
- **DocumentationView**: Documentation generation
- **CacheView**: Cache management
- **SettingsView**: Application settings

### State Management
Uses Zustand for global state:
- Theme preferences
- Analysis state and results
- Documentation state
- Cache statistics
- UI state (sidebar, current view)

### API Service
Centralized API client with:
- Axios interceptors
- Error handling
- Type-safe requests
- Automatic retries

## 🎨 Styling

### Tailwind CSS
- Utility-first approach
- Custom color scheme
- Dark mode support
- Responsive design

### Theme System
- CSS variables for colors
- Automatic dark mode
- Persistent theme preference
- Smooth transitions

## 🔧 Configuration

### Vite Configuration
- Fast HMR (Hot Module Replacement)
- Optimized builds
- Environment variable support
- Path aliases

### TypeScript
- Strict mode enabled
- Path aliases configured
- Type checking on build
- Full type coverage

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment

The frontend can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Configure in repository settings
- **AWS S3**: Upload `dist/` folder

Make sure to set the `VITE_API_BASE_URL` environment variable to your production API endpoint.

## 🔗 API Integration

The frontend communicates with the backend API at the configured endpoint. Ensure the backend is running before starting the frontend.

Default API endpoint: `http://localhost:3000`

## 🎓 Development Tips

1. **Hot Module Replacement**: Changes are reflected instantly
2. **Type Safety**: TypeScript catches errors at compile time
3. **State Management**: Use Zustand hooks for global state
4. **API Calls**: Use the centralized API service
5. **Styling**: Use Tailwind utility classes

## 📄 License

MIT License - see LICENSE file for details
