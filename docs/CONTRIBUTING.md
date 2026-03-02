# Contributing to CodeLens

Thank you for your interest in contributing to CodeLens! This document provides guidelines and instructions for contributing.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or pnpm
- Git
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/codelens.git
   cd codelens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

---

## 📋 Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/add-python-analyzer`)
- `fix/` - Bug fixes (e.g., `fix/diagram-rendering`)
- `docs/` - Documentation updates (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/analyzer-structure`)
- `test/` - Test additions/updates (e.g., `test/add-e2e-tests`)

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(analyzer): add Python AST parsing support

Implements Python code analysis using the ast module.
Includes support for classes, functions, and imports.

Closes #123
```

```
fix(frontend): resolve diagram rendering issue

Fixed Mermaid diagram not rendering in Safari.
Added fallback for unsupported browsers.
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:backend
npm run test:frontend
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain minimum 80% code coverage
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

**Example:**
```typescript
describe('TypeScriptAnalyzer', () => {
  it('should extract function definitions from source code', () => {
    // Arrange
    const sourceCode = 'function hello() { return "world"; }';
    const analyzer = new TypeScriptAnalyzer();
    
    // Act
    const result = analyzer.analyze(sourceCode);
    
    // Assert
    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].name).toBe('hello');
  });
});
```

---

## 📝 Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional programming patterns
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the component structure:
  ```typescript
  // Imports
  import React from 'react';
  
  // Types
  interface Props {
    title: string;
  }
  
  // Component
  export const MyComponent: React.FC<Props> = ({ title }) => {
    // Hooks
    const [state, setState] = useState();
    
    // Handlers
    const handleClick = () => {};
    
    // Render
    return <div>{title}</div>;
  };
  ```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use semantic color names
- Keep custom CSS minimal

---

## 🔍 Code Review Process

1. **Create a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure all tests pass

2. **Review Checklist**
   - [ ] Code follows style guidelines
   - [ ] Tests are included and passing
   - [ ] Documentation is updated
   - [ ] No console errors or warnings
   - [ ] Performance impact considered

3. **Addressing Feedback**
   - Respond to all comments
   - Make requested changes
   - Re-request review when ready

---

## 🐛 Reporting Bugs

### Before Submitting

- Check existing issues
- Verify it's reproducible
- Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.10.0]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

---

## 💡 Feature Requests

### Before Submitting

- Check if feature already exists
- Search existing feature requests
- Consider if it fits project scope

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

---

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Improving clarity

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Keep it up to date

---

## 🎯 Areas for Contribution

### Good First Issues

Look for issues labeled `good-first-issue`:
- Documentation improvements
- Simple bug fixes
- Test additions
- UI polish

### High Priority

- Performance optimizations
- Additional language analyzers
- Export format support
- Accessibility improvements

### Advanced

- AST parsing enhancements
- Diagram generation algorithms
- Real-time collaboration features
- Plugin system

---

## 🤝 Community

### Communication Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General questions and ideas
- Pull Requests - Code contributions

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## ❓ Questions?

If you have questions about contributing, feel free to:
- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

---

**Thank you for contributing to CodeLens!** 🚀