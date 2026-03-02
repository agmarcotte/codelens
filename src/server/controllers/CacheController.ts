/**
 * Cache controller
 */

import { Request, Response } from 'express';
import { analysisCache, fileCache, documentationCache } from '@utils/cache.js';
import logger from '@utils/logger.js';
import type { ApiResponse } from '@shared/types';

export class CacheController {
  /**
   * Get cache statistics
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = {
        analysis: analysisCache.getStats(),
        file: fileCache.getStats(),
        documentation: documentationCache.getStats(),
        hitRates: {
          analysis: analysisCache.getHitRate(),
          file: fileCache.getHitRate(),
          documentation: documentationCache.getHitRate(),
        },
      };

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(_req: Request, res: Response): Promise<void> {
    try {
      analysisCache.clear();
      fileCache.clear();
      documentationCache.clear();

      logger.info('All caches cleared');

      const response: ApiResponse = {
        success: true,
        data: { message: 'All caches cleared successfully' },
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Delete specific cache entry
   */
  async deleteEntry(req: Request, res: Response): Promise<void> {
    const { key } = req.params;

    try {
      // Try to delete from all caches
      const deleted =
        analysisCache.delete(key) +
        fileCache.delete(key) +
        documentationCache.delete(key);

      if (deleted > 0) {
        logger.info(`Cache entry deleted: ${key}`);
        const response: ApiResponse = {
          success: true,
          data: { message: `Cache entry '${key}' deleted successfully` },
          timestamp: Date.now(),
        };
        res.json(response);
      } else {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Cache entry '${key}' not found`,
          },
          timestamp: Date.now(),
        };
        res.status(404).json(response);
      }
    } catch (error) {
      logger.error(`Failed to delete cache entry ${key}:`, error);
      throw error;
    }
  }
}

export default CacheController;