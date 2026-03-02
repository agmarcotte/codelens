/**
 * Base analyzer interface for code analysis
 */

import type { AnalysisResult, Language } from '@shared/types';

export interface AnalyzerOptions {
  includePrivate?: boolean;
  includeTests?: boolean;
  maxFileSize?: number;
}

/**
 * Abstract base class for code analyzers
 */
export abstract class BaseAnalyzer {
  protected readonly language: Language;
  protected readonly options: AnalyzerOptions;

  constructor(language: Language, options: AnalyzerOptions = {}) {
    this.language = language;
    this.options = {
      includePrivate: options.includePrivate ?? true,
      includeTests: options.includeTests ?? false,
      maxFileSize: options.maxFileSize ?? 10485760, // 10MB
    };
  }

  /**
   * Analyze a single file
   */
  abstract analyzeFile(filePath: string, content: string): Promise<AnalysisResult>;

  /**
   * Analyze multiple files
   */
  async analyzeFiles(files: Array<{ path: string; content: string }>): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const file of files) {
      try {
        const result = await this.analyzeFile(file.path, file.content);
        results.push(result);
      } catch (error) {
        throw new Error(
          `Failed to analyze ${file.path}: ${(error as Error).message}`
        );
      }
    }

    return results;
  }

  /**
   * Check if file should be analyzed
   */
  protected shouldAnalyzeFile(filePath: string, content: string): boolean {
    // Check file size
    const size = Buffer.byteLength(content, 'utf-8');
    if (size > this.options.maxFileSize!) {
      return false;
    }

    // Check if it's a test file
    if (!this.options.includeTests) {
      const isTestFile =
        filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.includes('__tests__');
      if (isTestFile) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get supported file extensions
   */
  abstract getSupportedExtensions(): string[];

  /**
   * Get language name
   */
  getLanguage(): Language {
    return this.language;
  }

  /**
   * Calculate cyclomatic complexity
   */
  protected calculateCyclomaticComplexity(code: string): number {
    // Count decision points
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bfor\b/g,
      /\bwhile\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\s*.*\s*:/g, // ternary operator
      /&&/g,
      /\|\|/g,
    ];

    let complexity = 1; // Base complexity

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Calculate cognitive complexity
   */
  protected calculateCognitiveComplexity(code: string): number {
    // Simplified cognitive complexity calculation
    // In a real implementation, this would use AST analysis
    let complexity = 0;
    let nestingLevel = 0;

    const lines = code.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Increase nesting
      if (trimmed.includes('{')) {
        nestingLevel++;
      }

      // Decrease nesting
      if (trimmed.includes('}')) {
        nestingLevel = Math.max(0, nestingLevel - 1);
      }

      // Add complexity for control structures
      if (
        /\b(if|for|while|switch|catch)\b/.test(trimmed) ||
        /&&|\|\|/.test(trimmed)
      ) {
        complexity += 1 + nestingLevel;
      }
    }

    return complexity;
  }

  /**
   * Calculate maintainability index
   */
  protected calculateMaintainabilityIndex(
    linesOfCode: number,
    cyclomaticComplexity: number,
    halsteadVolume: number = 100
  ): number {
    // Maintainability Index formula
    // MI = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
    // Where V = Halstead Volume, G = Cyclomatic Complexity, LOC = Lines of Code

    if (linesOfCode === 0) return 100;

    const mi =
      171 -
      5.2 * Math.log(halsteadVolume) -
      0.23 * cyclomaticComplexity -
      16.2 * Math.log(linesOfCode);

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, mi));
  }

  /**
   * Count lines of code (excluding comments and blank lines)
   */
  protected countLinesOfCode(code: string): number {
    const lines = code.split('\n');
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        count++;
      }
    }

    return count;
  }

  /**
   * Extract documentation comment
   */
  protected extractDocumentation(comments: string[]): string | undefined {
    if (comments.length === 0) return undefined;

    // Find JSDoc-style comments
    const docComments = comments.filter(
      (c) => c.trim().startsWith('/**') || c.trim().startsWith('##')
    );

    if (docComments.length === 0) return undefined;

    // Clean up the comment
    return docComments[0]
      .replace(/^\/\*\*|\*\/$/g, '')
      .replace(/^\s*\*\s?/gm, '')
      .trim();
  }
}

export default BaseAnalyzer;