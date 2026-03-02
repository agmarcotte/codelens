import { useState } from 'react';
import { FileSearch, Folder, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';
import { AnalysisResults } from '../analysis/AnalysisResults';

export function AnalyzeView() {
  const [filePath, setFilePath] = useState('');
  const [isDirectory, setIsDirectory] = useState(false);
  const { analysis, setAnalyzing, setAnalysisResult, setAnalysisResults, setAnalysisError } =
    useAppStore();

  const handleAnalyze = async () => {
    if (!filePath.trim()) {
      setAnalysisError('Please enter a file or directory path');
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysisError(undefined);

      if (isDirectory) {
        const results = await apiService.analyzeDirectory({
          path: filePath,
          recursive: true,
          useCache: true,
        });
        setAnalysisResults(results);
      } else {
        const result = await apiService.analyzeFile({
          path: filePath,
          useCache: true,
        });
        setAnalysisResult(result);
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Code Analysis</h2>
        <p className="text-muted-foreground">
          Analyze your code to extract functions, classes, and complexity metrics
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="filePath" className="block text-sm font-medium mb-2">
              File or Directory Path
            </label>
            <input
              id="filePath"
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="e.g., ./src/index.ts or ./src"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={analysis.isAnalyzing}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isDirectory"
              type="checkbox"
              checked={isDirectory}
              onChange={(e) => setIsDirectory(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={analysis.isAnalyzing}
            />
            <label htmlFor="isDirectory" className="text-sm font-medium">
              Analyze entire directory
            </label>
          </div>

          {analysis.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {analysis.error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analysis.isAnalyzing}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analysis.isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                {isDirectory ? (
                  <Folder className="mr-2 h-4 w-4" />
                ) : (
                  <FileSearch className="mr-2 h-4 w-4" />
                )}
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {(analysis.result || analysis.isAnalyzing) && <AnalysisResults />}
    </div>
  );
}