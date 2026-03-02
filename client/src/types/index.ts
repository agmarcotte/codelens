// Analysis Types
export interface FunctionInfo {
  name: string;
  params: Array<{
    name: string;
    type?: string;
    optional?: boolean;
    defaultValue?: string;
  }>;
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  documentation?: string;
  complexity: {
    cyclomatic: number;
    cognitive: number;
    maintainability: number;
  };
  lineStart: number;
  lineEnd: number;
}

export interface ClassInfo {
  name: string;
  isExported: boolean;
  extends?: string;
  implements?: string[];
  methods: FunctionInfo[];
  properties: Array<{
    name: string;
    type?: string;
    isStatic: boolean;
    isPrivate: boolean;
  }>;
  documentation?: string;
  lineStart: number;
  lineEnd: number;
}

export interface InterfaceInfo {
  name: string;
  isExported: boolean;
  extends?: string[];
  properties: Array<{
    name: string;
    type?: string;
    optional?: boolean;
  }>;
  documentation?: string;
  lineStart: number;
  lineEnd: number;
}

export interface ImportInfo {
  source: string;
  imports: Array<{
    name: string;
    alias?: string;
    isDefault: boolean;
  }>;
}

export interface ExportInfo {
  name: string;
  isDefault: boolean;
  type: 'function' | 'class' | 'interface' | 'variable' | 'type';
}

export interface AnalysisResult {
  filePath: string;
  language: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  dependencies: string[];
  complexity: {
    average: number;
    max: number;
    total: number;
  };
  linesOfCode: number;
  timestamp: string;
}

// Documentation Types
export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
}

export interface DiagramInfo {
  type: 'class' | 'component' | 'flowchart' | 'sequence';
  title: string;
  content: string;
  description?: string;
}

export interface Documentation {
  title: string;
  description?: string;
  sections: Array<{
    title: string;
    content: string;
    subsections?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  examples?: CodeExample[];
  diagrams?: DiagramInfo[];
  metadata: {
    generatedAt: string;
    version: string;
    author?: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Cache Types
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  entries: number;
}

// UI State Types
export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  currentFile?: string;
  result?: AnalysisResult;
  error?: string;
}

export interface DocumentationState {
  isGenerating: boolean;
  documentation?: Documentation;
  markdown?: string;
  error?: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentView: 'analyze' | 'documentation' | 'cache' | 'settings';
}

// Request Types
export interface AnalyzeFileRequest {
  path: string;
  useCache?: boolean;
}

export interface AnalyzeDirectoryRequest {
  path: string;
  recursive?: boolean;
  filePattern?: string;
  useCache?: boolean;
}

export interface GenerateDocumentationRequest {
  analysisResult?: AnalysisResult;
  projectPath?: string;
  options?: {
    includePrivate?: boolean;
    includeDiagrams?: boolean;
    includeExamples?: boolean;
  };
}

export interface GenerateDiagramRequest {
  type: 'class' | 'component' | 'flowchart' | 'sequence';
  analysisResult: AnalysisResult;
  title?: string;
}