# Changelog

All notable changes to CodeLens will be documented in this file.

## [1.1.0] - 2026-03-03

### Added
- Single command startup using `concurrently` - run both backend and frontend with `npm run dev`
- Color-coded console output (blue for backend, green for frontend)
- New npm scripts: `dev:server`, `dev:client`, and `build:all`
- Comprehensive security audit and vulnerability fixes

### Changed
- Updated TypeScript ESLint packages from v6.17.0 to v8.0.0
- Migrated to Tailwind CSS v4 with `@tailwindcss/postcss`
- Updated all documentation to reflect new single-command startup
- Backend now runs on port 3000 (previously 3001)
- Improved error handling and troubleshooting documentation

### Fixed
- Fixed all 6 high-severity security vulnerabilities (minimatch ReDoS issues)
- Fixed Tailwind CSS v4 compatibility issues in PostCSS configuration
- Fixed unused import in SettingsView component
- Converted `@apply` directives to standard CSS for Tailwind v4
- Added Jest types to tsconfig.json for proper test support

### Security
- **CRITICAL**: Upgraded @typescript-eslint packages to fix ReDoS vulnerabilities
- Current status: 0 vulnerabilities in both backend and frontend
- All dependencies audited and updated

### Documentation
- Updated README.md with single-command startup instructions
- Updated QUICK_START.md with new development workflow
- Updated docs/GETTING_STARTED.md with comprehensive setup guide
- Added troubleshooting section for common issues
- Created CHANGELOG.md to track project changes

## [1.0.0] - Initial Release

### Added
- Initial project setup with TypeScript backend and React frontend
- Code analysis engine for TypeScript/JavaScript
- Documentation generation with Markdown export
- Three-tier caching system
- Interactive web UI with dark mode
- Comprehensive test suites (unit, integration, e2e)
- API endpoints for file and project analysis
- Cache management functionality