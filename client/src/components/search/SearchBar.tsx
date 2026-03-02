/**
 * Search bar component for finding code and documentation
 */

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileCode, Package, Hash } from 'lucide-react';

interface SearchResult {
  type: 'function' | 'class' | 'interface' | 'file';
  name: string;
  file: string;
  line?: number;
  description?: string;
}

interface SearchBarProps {
  onResultSelect?: (result: SearchResult) => void;
}

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search function - in production, this would call the API
  const performSearch = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    // Mock results for demonstration
    const mockResults: SearchResult[] = [
      {
        type: 'function',
        name: 'analyzeFile',
        file: 'src/server/analyzers/TypeScriptAnalyzer.ts',
        line: 42,
        description: 'Analyzes a TypeScript/JavaScript file',
      },
      {
        type: 'class',
        name: 'TypeScriptAnalyzer',
        file: 'src/server/analyzers/TypeScriptAnalyzer.ts',
        line: 18,
        description: 'Main analyzer class for TypeScript',
      },
      {
        type: 'interface',
        name: 'AnalysisResult',
        file: 'src/shared/types.ts',
        line: 12,
        description: 'Result of code analysis',
      },
      {
        type: 'file',
        name: 'BaseAnalyzer.ts',
        file: 'src/server/analyzers/BaseAnalyzer.ts',
        description: 'Base class for all analyzers',
      },
    ];

    return mockResults.filter(
      (result) =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.file.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query) {
        const searchResults = performSearch(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(0);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'function':
        return <Hash className="w-4 h-4" />;
      case 'class':
        return <Package className="w-4 h-4" />;
      case 'interface':
        return <FileCode className="w-4 h-4" />;
      case 'file':
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'function':
        return 'text-blue-500';
      case 'class':
        return 'text-green-500';
      case 'interface':
        return 'text-purple-500';
      case 'file':
        return 'text-orange-500';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search functions, classes, files..."
          className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.name}-${index}`}
              onClick={() => handleResultClick(result)}
              className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${getTypeColor(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{result.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(result.type)} bg-opacity-10`}>
                      {result.type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 truncate">
                    {result.file}
                    {result.line && `:${result.line}`}
                  </div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query && results.length === 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg p-4 z-50"
        >
          <div className="text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No results found for "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;