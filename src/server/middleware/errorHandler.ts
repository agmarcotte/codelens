/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger.js';
import type { ApiResponse, ApiError } from '@shared/types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code and error details
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errorMessage = 'An unexpected error occurred';
  let errorDetails: Record<string, unknown> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    errorMessage = err.message;
    errorDetails = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    errorMessage = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
    errorMessage = 'Authentication required';
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    errorMessage = 'Invalid JSON in request body';
  }

  // Create error response
  const errorResponse: ApiError = {
    code: errorCode,
    message: errorMessage,
    details: errorDetails,
  };

  const response: ApiResponse = {
    success: false,
    error: errorResponse,
    timestamp: Date.now(),
  };

  // Send error response
  res.status(statusCode).json(response);
}

export default errorHandler;