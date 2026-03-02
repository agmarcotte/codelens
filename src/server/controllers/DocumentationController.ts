/**
 * Documentation generation controller
 */

import { Request, Response } from 'express';
import { TypeScriptAnalyzer } from '../analyzers/TypeScriptAnalyzer.js';
import { DocumentationGenerator } from '../services/DocumentationGenerator.js';
import { MermaidDiagramGenerator } from '../services/MermaidDiagramGenerator.js';
import { ExampleExtractor } from '../services/ExampleExtractor.js';
import { MarkdownBuilder } from '../services/MarkdownBuilder.js';
import { documentationCache } from '@utils/cache.js';
import { listFiles, readFile } from '@utils/fileSystem.js';
import logger from '@utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  ApiResponse,
  GenerateDocsRequest,
  Documentation,
  AnalysisResult,
} from '@shared/types';

export class DocumentationController {
  /**
   * Generate documentation from analysis results
   */
  async generateDocumentation(req: Request, res: Response): Promise<void> {
    const { analysisResults, options } = req.body as GenerateDocsRequest;

    if (!analysisResults || analysisResults.length === 0) {
      throw new AppError(400, 'MISSING_ANALYSIS', 'Analysis results are required');
    }

    try {
      logger.info(`Generating documentation for ${analysisResults.length} files`);

      // Check cache
      const cacheKey = this.generateCacheKey(analysisResults, options);
      const cached = documentationCache.get(cacheKey) as Documentation | undefined;

      if (cached) {
        logger.info('Returning cached documentation');
        const response: ApiResponse<Documentation> = {
          success: true,
          data: cached,
          timestamp: Date.now(),
        };
        res.json(response);
        return;
      }

      // Generate documentation
      const docGenerator = new DocumentationGenerator(options);
      const projectName = this.extractProjectName(analysisResults);
      const documentation = await docGenerator.generate(analysisResults, projectName);

      // Generate diagrams if requested
      if (options?.includeDiagrams !== false) {
        const diagramGenerator = new MermaidDiagramGenerator();
        documentation.diagrams = await diagramGenerator.generateDiagrams(analysisResults);
      }

      // Extract examples if requested
      if (options?.includeExamples !== false) {
        const exampleExtractor = new ExampleExtractor();
        documentation.examples = await exampleExtractor.extractExamples(analysisResults);
        
        // Add quick start example
        const quickStart = exampleExtractor.generateQuickStartExample(
          analysisResults,
          projectName
        );
        documentation.examples.unshift(quickStart);
      }

      // Cache the result
      documentationCache.set(cacheKey, documentation);

      const response: ApiResponse<Documentation> = {
        success: true,
        data: documentation,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to generate documentation:', error);
      throw new AppError(
        500,
        'GENERATION_FAILED',
        `Documentation generation failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate documentation from a project path
   */
  async generateFromProject(req: Request, res: Response): Promise<void> {
    const {
      path: projectPath,
      recursive = true,
      includeTests = false,
      options,
    } = req.body;

    if (!projectPath) {
      throw new AppError(400, 'MISSING_PATH', 'Project path is required');
    }

    try {
      logger.info(`Generating documentation for project: ${projectPath}`);

      // List all files
      const fileInfos = await listFiles(projectPath, recursive);
      
      // Filter files
      const analyzer = new TypeScriptAnalyzer();
      const supportedExtensions = analyzer.getSupportedExtensions();
      const filteredFiles = fileInfos.filter(fileInfo => {
        const ext = fileInfo.path.substring(fileInfo.path.lastIndexOf('.'));
        const isSupported = supportedExtensions.includes(ext);
        const isTest = fileInfo.path.includes('.test.') || fileInfo.path.includes('.spec.');
        return isSupported && (includeTests || !isTest);
      });

      if (filteredFiles.length === 0) {
        throw new AppError(404, 'NO_FILES', 'No supported files found in project');
      }

      // Analyze all files
      const analysisResults: AnalysisResult[] = [];
      for (const fileInfo of filteredFiles) {
        try {
          const content = await readFile(fileInfo.path);
          const result = await analyzer.analyzeFile(fileInfo.path, content);
          analysisResults.push(result);
        } catch (error) {
          logger.warn(`Failed to analyze ${fileInfo.path}:`, error);
        }
      }

      if (analysisResults.length === 0) {
        throw new AppError(500, 'ANALYSIS_FAILED', 'Failed to analyze any files');
      }

      // Generate documentation
      const docGenerator = new DocumentationGenerator(options);
      const projectName = projectPath.split('/').pop() || 'Project';
      const documentation = await docGenerator.generate(analysisResults, projectName);

      // Generate diagrams
      if (options?.includeDiagrams !== false) {
        const diagramGenerator = new MermaidDiagramGenerator();
        documentation.diagrams = await diagramGenerator.generateDiagrams(analysisResults);
      }

      // Extract examples
      if (options?.includeExamples !== false) {
        const exampleExtractor = new ExampleExtractor();
        documentation.examples = await exampleExtractor.extractExamples(analysisResults);
        
        const quickStart = exampleExtractor.generateQuickStartExample(
          analysisResults,
          projectName
        );
        documentation.examples.unshift(quickStart);
      }

      const response: ApiResponse<Documentation> = {
        success: true,
        data: documentation,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      logger.error('Failed to generate documentation from project:', error);
      throw new AppError(
        500,
        'GENERATION_FAILED',
        `Documentation generation failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Export documentation as markdown
   */
  async exportMarkdown(req: Request, res: Response): Promise<void> {
    const { documentation } = req.body as { documentation: Documentation };

    if (!documentation) {
      throw new AppError(400, 'MISSING_DOCUMENTATION', 'Documentation object is required');
    }

    try {
      logger.info('Exporting documentation as markdown');

      const markdownBuilder = new MarkdownBuilder();
      const markdown = markdownBuilder.buildMarkdown(documentation);

      const response: ApiResponse<{ markdown: string }> = {
        success: true,
        data: { markdown },
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to export markdown:', error);
      throw new AppError(
        500,
        'EXPORT_FAILED',
        `Markdown export failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Download documentation as markdown file
   */
  async downloadMarkdown(req: Request, res: Response): Promise<void> {
    const { documentation } = req.body as { documentation: Documentation };

    if (!documentation) {
      throw new AppError(400, 'MISSING_DOCUMENTATION', 'Documentation object is required');
    }

    try {
      logger.info('Downloading documentation as markdown file');

      const markdownBuilder = new MarkdownBuilder();
      const markdown = markdownBuilder.buildMarkdown(documentation);

      const fileName = `${documentation.metadata.projectName.replace(/\s+/g, '-')}-docs.md`;

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(markdown);
    } catch (error) {
      logger.error('Failed to download markdown:', error);
      throw new AppError(
        500,
        'DOWNLOAD_FAILED',
        `Markdown download failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate a specific diagram
   */
  async generateDiagram(req: Request, res: Response): Promise<void> {
    const { analysisResults, type, entryPoint } = req.body as {
      analysisResults: AnalysisResult[];
      type: 'class' | 'component' | 'sequence' | 'flowchart';
      entryPoint?: string;
    };

    if (!analysisResults || analysisResults.length === 0) {
      throw new AppError(400, 'MISSING_ANALYSIS', 'Analysis results are required');
    }

    try {
      logger.info(`Generating ${type} diagram`);

      const diagramGenerator = new MermaidDiagramGenerator();
      let diagram;

      switch (type) {
        case 'sequence':
          if (!entryPoint) {
            throw new AppError(400, 'MISSING_ENTRY_POINT', 'Entry point is required for sequence diagrams');
          }
          diagram = diagramGenerator.generateSequenceDiagram(analysisResults, entryPoint);
          break;
        default:
          const diagrams = await diagramGenerator.generateDiagrams(analysisResults);
          diagram = diagrams.find(d => d.type === type);
      }

      if (!diagram) {
        throw new AppError(404, 'DIAGRAM_NOT_FOUND', `No ${type} diagram could be generated`);
      }

      const response: ApiResponse = {
        success: true,
        data: diagram,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      logger.error('Failed to generate diagram:', error);
      throw new AppError(
        500,
        'DIAGRAM_FAILED',
        `Diagram generation failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate cache key for documentation
   */
  private generateCacheKey(analysisResults: AnalysisResult[], options?: unknown): string {
    const paths = analysisResults.map(r => r.filePath).sort().join('|');
    const timestamps = analysisResults.map(r => r.timestamp).join('|');
    const optionsStr = JSON.stringify(options || {});
    return `docs:${paths}:${timestamps}:${optionsStr}`;
  }

  /**
   * Extract project name from analysis results
   */
  private extractProjectName(analysisResults: AnalysisResult[]): string {
    if (analysisResults.length === 0) return 'Project';

    // Try to find a common base path
    const paths = analysisResults.map(r => r.filePath);
    const parts = paths[0].split('/');
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const candidate = parts.slice(0, i + 1).join('/');
      if (paths.every(p => p.startsWith(candidate))) {
        return parts[i] || 'Project';
      }
    }

    return 'Project';
  }
}

export default DocumentationController;