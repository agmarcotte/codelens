/**
 * Main API router
 */

import { Router } from 'express';
import { analyzeRouter } from './analyze.js';
import { cacheRouter } from './cache.js';
import { documentationRouter } from './documentation.js';

export const apiRouter = Router();

// Mount sub-routers
apiRouter.use('/analyze', analyzeRouter);
apiRouter.use('/cache', cacheRouter);
apiRouter.use('/documentation', documentationRouter);

// API info endpoint
apiRouter.get('/', (_req, res) => {
  res.json({
    name: 'CodeLens API',
    version: '1.0.0',
    description: 'AI-powered interactive documentation generator',
    endpoints: {
      analyze: '/analyze',
      cache: '/cache',
      documentation: '/documentation',
    },
  });
});

export default apiRouter;