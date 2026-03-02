/**
 * Shared type definitions for CodeLens
 */

// ============================================================================
// Code Analysis Types
// ============================================================================

export interface AnalysisResult {
  filePath: string;
  language: string;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  imports: ImportInfo[];
  exports: ExportInfo[];
  complexity: ComplexityMetrics;
  dependencies: string[];
  timestamp: number;
}

export interface FunctionInfo {
  name: string;
  line: number;
  endLine: number;
  params: ParameterInfo[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  complexity: number;
  documentation?: string;
}

export interface ClassInfo {
  name: string;
  line: number;
  endLine: number;
  methods: MethodInfo[];
  properties: PropertyInfo[];
  extends?: string;
  implements?: string[];
  isExported: boolean;
  documentation?: string;
}

export interface InterfaceInfo {
  name: string;
  line: number;
  endLine: number;
  properties: PropertyInfo[];
  extends?: string[];
  isExported: boolean;
  documentation?: string;
}

export interface MethodInfo {
  name: string;
  line: number;
  params: ParameterInfo[];
  returnType?: string;
  isAsync: boolean;
  isStatic: boolean;
  visibility: 'public' | 'private' | 'protected';
  complexity: number;
  documentation?: string;
}

export interface PropertyInfo {
  name: string;
  type?: string;
  line: number;
  isOptional: boolean;
  isReadonly: boolean;
  visibility?: 'public' | 'private' | 'protected';
  documentation?: string;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  isOptional: boolean;
  defaultValue?: string;
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  line: number;
}

export interface ExportInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable' | 'type';
  isDefault: boolean;
  line: number;
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  linesOfCode: number;
  maintainabilityIndex: number;
}

// ============================================================================
// Documentation Types
// ============================================================================

export interface Documentation {
  title: string;
  description: string;
  sections: DocumentationSection[];
  diagrams: DiagramInfo[];
  examples: CodeExample[];
  metadata: DocumentationMetadata;
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocumentationSection[];
  codeBlocks?: CodeBlock[];
}

export interface DiagramInfo {
  type: 'class' | 'sequence' | 'flowchart' | 'component';
  title: string;
  mermaidCode: string;
  description?: string;
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: string;
  output?: string;
}

export interface CodeBlock {
  code: string;
  language: string;
  fileName?: string;
  startLine?: number;
  endLine?: number;
}

export interface DocumentationMetadata {
  generatedAt: number;
  version: string;
  projectName: string;
  author?: string;
  license?: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AnalyzeRequest {
  path: string;
  recursive?: boolean;
  includeTests?: boolean;
  maxDepth?: number;
}

export interface GenerateDocsRequest {
  analysisResults: AnalysisResult[];
  options?: DocumentationOptions;
}

export interface DocumentationOptions {
  includePrivate?: boolean;
  includeDiagrams?: boolean;
  includeExamples?: boolean;
  format?: 'markdown' | 'html' | 'pdf';
  theme?: 'light' | 'dark';
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  modifiedAt: number;
}

export interface DirectoryTree {
  path: string;
  name: string;
  children: DirectoryTree[];
  files: FileInfo[];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface ServerConfig {
  port: number;
  host: string;
  apiPrefix: string;
  corsOrigin: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface AnalyzerConfig {
  maxFileSize: number;
  supportedExtensions: string[];
  excludePatterns: string[];
  includeTests: boolean;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  enabled: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Language = 'typescript' | 'javascript' | 'python';

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface ProgressInfo {
  current: number;
  total: number;
  status: AnalysisStatus;
  message?: string;
}