/**
 * 404 Not Found handler middleware
 */

import { Request, Response } from 'express';
import type { ApiResponse } from '@shared/types';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: Date.now(),
  };

  res.status(404).json(response);
}

export default notFoundHandler;