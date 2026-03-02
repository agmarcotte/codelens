/**
 * Cache management routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { CacheController } from '../controllers/CacheController.js';

export const cacheRouter = Router();
const controller = new CacheController();

/**
 * GET /cache/stats
 * Get cache statistics
 */
cacheRouter.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getStats(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /cache/clear
 * Clear all cache
 */
cacheRouter.delete('/clear', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.clearCache(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /cache/:key
 * Delete specific cache entry
 */
cacheRouter.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.deleteEntry(req, res);
  } catch (error) {
    next(error);
  }
});

export default cacheRouter;