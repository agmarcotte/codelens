import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';

export function DocumentationView() {
  const [projectPath, setProjectPath] = useState('');
  const {
    documentation,
    analysisResults,
    setGeneratingDocumentation,
    setDocumentation,
    setMarkdown,
    setDocumentationError,
  } = useAppStore();

  const handleGenerate = async () => {
    if (!projectPath.trim() && analysisResults.length === 0) {
      setDocumentationError('Please analyze code first or provide a project path');
      return;
    }

    try {
      setGeneratingDocumentation(true);
      setDocumentationError(undefined);

      let doc;
      if (projectPath.trim()) {
        doc = await apiService.generateDocumentationFromProject(projectPath, {
          includePrivate: false,
          includeDiagrams: true,
          includeExamples: true,
        });
      } else if (analysisResults.length > 0) {
        doc = await apiService.generateDocumentation({
          analysisResult: analysisResults[0],
          options: {
            includePrivate: false,
            includeDiagrams: true,
            includeExamples: true,
          },
        });
      }

      if (doc) {
        setDocumentation(doc);
        const markdown = await apiService.exportDocumentationAsMarkdown(doc);
        setMarkdown(markdown);
      }
    } catch (error) {
      setDocumentationError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setGeneratingDocumentation(false);
    }
  };

  const handleDownload = async () => {
    if (!documentation.documentation) return;

    try {
      const blob = await apiService.downloadMarkdown(
        documentation.documentation,
        'documentation.md'
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentation.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
        <p className="text-muted-foreground">
          Generate comprehensive documentation from your code analysis
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="projectPath" className="block text-sm font-medium mb-2">
              Project Path (optional)
            </label>
            <input
              id="projectPath"
              type="text"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="e.g., ./src"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={documentation.isGenerating}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave empty to use current analysis results
            </p>
          </div>

          {documentation.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {documentation.error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={documentation.isGenerating}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {documentation.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Documentation
                </>
              )}
            </button>

            {documentation.documentation && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Markdown
              </button>
            )}
          </div>
        </div>
      </div>

      {documentation.markdown && (
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h3 className="font-semibold">Generated Documentation</h3>
          </div>
          <div className="p-4">
            <pre className="overflow-auto rounded-md bg-muted p-4 text-sm scrollbar-thin">
              <code>{documentation.markdown}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}