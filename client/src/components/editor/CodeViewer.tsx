/**
 * Code viewer component for displaying code with syntax highlighting
 */

import { CodeEditor } from './CodeEditor';

interface CodeViewerProps {
  code: string;
  language?: string;
  fileName?: string;
  showLineNumbers?: boolean;
  height?: string;
}

export function CodeViewer({
  code,
  language = 'typescript',
  fileName,
  showLineNumbers = true,
  height = '400px',
}: CodeViewerProps) {
  return (
    <div className="space-y-2">
      {fileName && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-t-lg border border-border">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase">{language}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Copy code"
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      <CodeEditor
        value={code}
        language={language}
        readOnly={true}
        height={height}
        showMinimap={false}
        lineNumbers={showLineNumbers ? 'on' : 'off'}
      />
    </div>
  );
}

export default CodeViewer;