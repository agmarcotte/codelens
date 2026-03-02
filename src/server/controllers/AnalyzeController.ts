/**
 * Analysis controller
 */

import { Request, Response } from 'express';
import { TypeScriptAnalyzer } from '../analyzers/TypeScriptAnalyzer.js';
import { analysisCache } from '@utils/cache.js';
import { listFiles, readFile, getFileInfo } from '@utils/fileSystem.js';
import logger from '@utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse, AnalysisResult, AnalyzeRequest } from '@shared/types';

export class AnalyzeController {
  private analyzer: TypeScriptAnalyzer;

  constructor() {
    this.analyzer = new TypeScriptAnalyzer({
      includePrivate: true,
      includeTests: false,
      maxFileSize: 10485760, // 10MB
    });
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(req: Request, res: Response): Promise<void> {
    const { path: filePath } = req.body;

    if (!filePath) {
      throw new AppError(400, 'MISSING_PATH', 'File path is required');
    }

    try {
      logger.info(`Analyzing file: ${filePath}`);

      // Check cache first
      const cacheKey = `file:${filePath}`;
      const cached = analysisCache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for ${filePath}`);
        const response: ApiResponse<AnalysisResult> = {
          success: true,
          data: cached as AnalysisResult,
          timestamp: Date.now(),
        };
        res.json(response);
        return;
      }

      // Read file content
      const content = await readFile(filePath);
      const fileInfo = await getFileInfo(filePath);

      // Check if file is supported
      const supportedExtensions = this.analyzer.getSupportedExtensions();
      if (!supportedExtensions.includes(fileInfo.extension)) {
        throw new AppError(
          400,
          'UNSUPPORTED_FILE',
          `File type ${fileInfo.extension} is not supported`
        );
      }

      // Analyze the file
      const result = await this.analyzer.analyzeFile(filePath, content);

      // Cache the result
      analysisCache.set(cacheKey, result);

      const response: ApiResponse<AnalysisResult> = {
        success: true,
        data: result,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error(`Failed to analyze file ${filePath}:`, error);
      throw new AppError(
        500,
        'ANALYSIS_FAILED',
        `Failed to analyze file: ${(error as Error).message}`
      );
    }
  }

  /**
   * Analyze all files in a directory
   */
  async analyzeDirectory(req: Request, res: Response): Promise<void> {
    const { path: dirPath, recursive = true, includeTests = false } = req.body as AnalyzeRequest;

    if (!dirPath) {
      throw new AppError(400, 'MISSING_PATH', 'Directory path is required');
    }

    try {
      logger.info(`Analyzing directory: ${dirPath}`);

      // Get all supported files
      const supportedExtensions = this.analyzer.getSupportedExtensions();
      const files = await listFiles(dirPath, {
        recursive,
        extensions: supportedExtensions,
        excludePatterns: includeTests ? [] : ['**/*.test.*', '**/*.spec.*', '**/__tests__/**'],
      });

      logger.info(`Found ${files.length} files to analyze`);

      // Analyze each file
      const results: AnalysisResult[] = [];
      for (const file of files) {
        try {
          const cacheKey = `file:${file.path}`;
          let result = analysisCache.get(cacheKey) as AnalysisResult | undefined;

          if (!result) {
            const content = await readFile(file.path);
            result = await this.analyzer.analyzeFile(file.path, content);
            analysisCache.set(cacheKey, result);
          }

          results.push(result);
        } catch (error) {
          logger.warn(`Failed to analyze ${file.path}:`, error);
          // Continue with other files
        }
      }

      const response: ApiResponse<AnalysisResult[]> = {
        success: true,
        data: results,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error(`Failed to analyze directory ${dirPath}:`, error);
      throw new AppError(
        500,
        'ANALYSIS_FAILED',
        `Failed to analyze directory: ${(error as Error).message}`
      );
    }
  }

  /**
   * Analyze an entire project
   */
  async analyzeProject(req: Request, res: Response): Promise<void> {
    const {
      path: projectPath,
      recursive = true,
      includeTests = false,
    } = req.body as AnalyzeRequest;

    if (!projectPath) {
      throw new AppError(400, 'MISSING_PATH', 'Project path is required');
    }

    try {
      logger.info(`Analyzing project: ${projectPath}`);

      // Check cache for entire project
      const cacheKey = `project:${projectPath}`;
      const cached = analysisCache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for project ${projectPath}`);
        const response: ApiResponse<AnalysisResult[]> = {
          success: true,
          data: cached as AnalysisResult[],
          timestamp: Date.now(),
        };
        res.json(response);
        return;
      }

      // Get all supported files
      const supportedExtensions = this.analyzer.getSupportedExtensions();
      const excludePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
      ];

      if (!includeTests) {
        excludePatterns.push('**/*.test.*', '**/*.spec.*', '**/__tests__/**');
      }

      const files = await listFiles(projectPath, {
        recursive,
        extensions: supportedExtensions,
        excludePatterns,
      });

      logger.info(`Found ${files.length} files in project`);

      // Analyze files in batches
      const batchSize = 10;
      const results: AnalysisResult[] = [];

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (file) => {
            try {
              const cacheKey = `file:${file.path}`;
              let result = analysisCache.get(cacheKey) as AnalysisResult | undefined;

              if (!result) {
                const content = await readFile(file.path);
                result = await this.analyzer.analyzeFile(file.path, content);
                analysisCache.set(cacheKey, result);
              }

              return result;
            } catch (error) {
              logger.warn(`Failed to analyze ${file.path}:`, error);
              return null;
            }
          })
        );

        results.push(...batchResults.filter((r): r is AnalysisResult => r !== null));
        logger.info(`Analyzed ${results.length}/${files.length} files`);
      }

      // Cache project results
      analysisCache.set(cacheKey, results, 7200); // 2 hours

      const response: ApiResponse<AnalysisResult[]> = {
        success: true,
        data: results,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error(`Failed to analyze project ${projectPath}:`, error);
      throw new AppError(
        500,
        'ANALYSIS_FAILED',
        `Failed to analyze project: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get analysis status (placeholder for future async analysis)
   */
  async getAnalysisStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // This is a placeholder for future implementation of async analysis
    const response: ApiResponse = {
      success: true,
      data: {
        id,
        status: 'completed',
        message: 'Analysis status tracking not yet implemented',
      },
      timestamp: Date.now(),
    };

    res.json(response);
  }
}

export default AnalyzeController;