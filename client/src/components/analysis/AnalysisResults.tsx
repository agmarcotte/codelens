import { useAppStore } from '../../store/useAppStore';
import { Code, Box, FileType, TrendingUp } from 'lucide-react';
import type { FunctionInfo, ClassInfo } from '../../types';

export function AnalysisResults() {
  const { analysis, analysisResults } = useAppStore();

  if (analysis.isAnalyzing) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">
              {analysis.currentFile || 'Analyzing...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const result = analysis.result;
  const hasMultipleResults = analysisResults.length > 1;

  if (!result && analysisResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Analysis Results</h3>

      {hasMultipleResults ? (
        <div className="space-y-4">
          {analysisResults.map((res, index) => (
            <ResultCard key={index} result={res} />
          ))}
        </div>
      ) : result ? (
        <ResultCard result={result} />
      ) : null}
    </div>
  );
}

function ResultCard({ result }: { result: any }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h4 className="font-semibold">{result.filePath}</h4>
        <p className="text-sm text-muted-foreground">{result.language}</p>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Code className="h-4 w-4" />}
          label="Functions"
          value={result.functions.length}
        />
        <StatCard
          icon={<Box className="h-4 w-4" />}
          label="Classes"
          value={result.classes.length}
        />
        <StatCard
          icon={<FileType className="h-4 w-4" />}
          label="Interfaces"
          value={result.interfaces.length}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg Complexity"
          value={result.complexity.average.toFixed(1)}
        />
      </div>

      {result.functions.length > 0 && (
        <div className="border-t p-4">
          <h5 className="mb-3 font-semibold">Functions</h5>
          <div className="space-y-2">
            {result.functions.slice(0, 5).map((func: FunctionInfo, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md bg-muted p-3"
              >
                <div>
                  <p className="font-mono text-sm">{func.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Lines {func.lineStart}-{func.lineEnd}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Complexity: {func.complexity.cyclomatic}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {func.isAsync ? 'Async' : 'Sync'}
                  </p>
                </div>
              </div>
            ))}
            {result.functions.length > 5 && (
              <p className="text-sm text-muted-foreground">
                +{result.functions.length - 5} more functions
              </p>
            )}
          </div>
        </div>
      )}

      {result.classes.length > 0 && (
        <div className="border-t p-4">
          <h5 className="mb-3 font-semibold">Classes</h5>
          <div className="space-y-2">
            {result.classes.slice(0, 3).map((cls: ClassInfo, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md bg-muted p-3"
              >
                <div>
                  <p className="font-mono text-sm">{cls.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cls.methods.length} methods, {cls.properties.length} properties
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Lines {cls.lineStart}-{cls.lineEnd}
                  </p>
                </div>
              </div>
            ))}
            {result.classes.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{result.classes.length - 3} more classes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}