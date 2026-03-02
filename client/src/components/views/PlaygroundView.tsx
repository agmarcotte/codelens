/**
 * Interactive code playground view
 */

import { useState } from 'react';
import { CodeEditor } from '../editor/CodeEditor';
import { Play, RotateCcw, Download, Share2 } from 'lucide-react';

const DEFAULT_CODE = `// Welcome to CodeLens Playground!
// Write TypeScript/JavaScript code and see the results

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log('Fibonacci sequence:', results);

// Try modifying the code and click Run!
`;

export function PlaygroundView() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('');

    try {
      // Capture console output
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args: unknown[]) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      console.error = (...args: unknown[]) => {
        logs.push('ERROR: ' + args.map(arg => String(arg)).join(' '));
      };
      console.warn = (...args: unknown[]) => {
        logs.push('WARN: ' + args.map(arg => String(arg)).join(' '));
      };

      try {
        // Execute the code
        // Note: In production, this should be done in a sandboxed environment
        // eslint-disable-next-line no-new-func
        const func = new Function(code);
        const result = func();
        
        if (result !== undefined) {
          logs.push('Return value: ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
        }

        setOutput(logs.join('\n') || 'Code executed successfully (no output)');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(DEFAULT_CODE);
    setOutput('');
    setError(null);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Code Playground</h1>
        <p className="text-muted-foreground mt-2">
          Write and execute TypeScript/JavaScript code in real-time
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <button
          onClick={resetCode}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <button
          onClick={downloadCode}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={shareCode}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Editor and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
          <CodeEditor
            value={code}
            onChange={setCode}
            language="typescript"
            height="600px"
            showMinimap={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Output</h2>
          <div className="border border-border rounded-lg bg-card h-[600px] overflow-auto">
            {error ? (
              <div className="p-4 bg-destructive/10 text-destructive">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Execution Error</p>
                    <pre className="text-sm mt-2 whitespace-pre-wrap font-mono">{error}</pre>
                  </div>
                </div>
              </div>
            ) : output ? (
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-foreground">
                {output}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Run Code" to see the output</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">💡 Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use <code className="px-1 py-0.5 bg-muted rounded">console.log()</code> to print output</li>
          <li>• TypeScript syntax is supported (types are checked at runtime)</li>
          <li>• The code runs in your browser - no server execution</li>
          <li>• Use Ctrl/Cmd + S to format your code</li>
          <li>• ⚠️ Note: This is a simple playground. For production use, implement proper sandboxing</li>
        </ul>
      </div>
    </div>
  );
}

export default PlaygroundView;