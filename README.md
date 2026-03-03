# 🔍 CodeLens - AI-Powered Interactive Documentation Generator

> A sophisticated tool that analyzes codebases and generates beautiful, interactive documentation with live code examples, architecture diagrams, and AI-powered insights.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**CodeLens** is a showcase project that demonstrates the full capabilities of modern IDE tooling, including:

- 📁 **Multi-file operations** - Analyze entire codebases
- 🧠 **Code intelligence** - AST parsing and analysis
- 🎨 **Beautiful UI** - Modern React with Tailwind CSS
- 🤖 **AI-powered insights** - Automatic summaries and examples
- 📊 **Visual diagrams** - Auto-generated Mermaid charts
- 🧪 **Comprehensive testing** - Unit, integration, and E2E tests
- 🔄 **Git integration** - Track documentation changes

---

## ✨ Features

### Smart Code Analysis
- Multi-language support (TypeScript, JavaScript, Python)
- AST-based parsing for accurate analysis
- Dependency graph generation
- Complexity metrics and code quality insights

### Interactive Documentation
- Live code examples with syntax highlighting
- Editable code playground powered by Monaco Editor
- Real-time preview and hot reload
- Advanced search and filtering

### Visual Architecture
- Auto-generated Mermaid diagrams
- Component relationship graphs
- Data flow visualizations
- Interactive diagram exploration

### Export & Sharing
- Static HTML export
- PDF generation
- Markdown output
- Shareable links

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd codelens

# Install dependencies (backend)
npm install

# Install dependencies (frontend)
cd client && npm install && cd ..

# Start both servers with one command
npm run dev
```

This will start:
- Backend API on `http://localhost:3000`
- Frontend app on `http://localhost:5173`

Then open `http://localhost:5173` in your browser!

---

## 📁 Project Structure

```
codelens/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript UI
├── docs/            # Project documentation
├── scripts/         # Build and deployment scripts
└── README.md        # This file
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** - Server framework
- **TypeScript** - Type safety
- **Babel/Acorn** - AST parsing
- **Mermaid** - Diagram generation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Framer Motion** - Animations

### Testing
- **Jest** - Unit testing
- **Vitest** - Frontend testing
- **Puppeteer** - E2E testing

---

## 📖 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and architecture
- [API Documentation](docs/API.md) - REST API reference
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 🎯 Why This Project?

This project serves as a comprehensive showcase of modern development practices:

1. **Full-Stack Development** - Complete backend and frontend implementation
2. **Code Quality** - TypeScript, linting, testing, and best practices
3. **Modern Tools** - Latest frameworks and libraries
4. **Real-World Utility** - Actually useful for developers
5. **Visual Appeal** - Beautiful, professional UI/UX
6. **Comprehensive Testing** - Unit, integration, and E2E coverage

---

## 🗺️ Roadmap

- [x] Project architecture and planning
- [ ] Backend API implementation
- [ ] Code analysis engine
- [ ] Frontend UI development
- [ ] Interactive playground
- [ ] Diagram generation
- [ ] Export functionality
- [ ] Comprehensive testing
- [ ] Documentation generation
- [ ] Deployment configuration

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by tools like JSDoc, TypeDoc, and Storybook
- Powered by the amazing open-source community

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Ready to generate beautiful documentation? Let's get started!** 🚀