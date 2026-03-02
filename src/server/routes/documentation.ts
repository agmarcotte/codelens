/**
 * Documentation generation routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { DocumentationController } from '../controllers/DocumentationController.js';

export const documentationRouter = Router();
const controller = new DocumentationController();

/**
 * POST /api/v1/documentation/generate
 * Generate documentation from analysis results
 */
documentationRouter.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.generateDocumentation(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/documentation/generate-from-project
 * Generate documentation from a project path
 */
documentationRouter.post('/generate-from-project', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.generateFromProject(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/documentation/export/markdown
 * Export documentation as markdown
 */
documentationRouter.post('/export/markdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.exportMarkdown(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/documentation/download/markdown
 * Download documentation as markdown file
 */
documentationRouter.post('/download/markdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.downloadMarkdown(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/documentation/diagram
 * Generate a specific diagram
 */
documentationRouter.post('/diagram', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller.generateDiagram(req, res);
  } catch (error) {
    next(error);
  }
});

export default documentationRouter;