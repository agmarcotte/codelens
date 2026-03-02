/**
 * Analysis routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AnalyzeController } from '../controllers/AnalyzeController.js';

export const analyzeRouter = Router();
const controller = new AnalyzeController();

/**
 * POST /analyze/file
 * Analyze a single file
 */
analyzeRouter.post('/file', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.analyzeFile(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /analyze/directory
 * Analyze all files in a directory
 */
analyzeRouter.post('/directory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.analyzeDirectory(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /analyze/project
 * Analyze an entire project
 */
analyzeRouter.post('/project', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.analyzeProject(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /analyze/status/:id
 * Get analysis status
 */
analyzeRouter.get('/status/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.getAnalysisStatus(req, res);
  } catch (error) {
    next(error);
  }
});

export default analyzeRouter;