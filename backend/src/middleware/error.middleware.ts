import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils';
import { config } from '../config';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  const message = config.server.isProduction
    ? 'Internal server error'
    : err.message || 'Internal server error';

  sendError(res, message, 500);
}
