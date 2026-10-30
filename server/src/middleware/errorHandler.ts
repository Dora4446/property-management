import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Middleware]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation Error', formattedErrors, 422);
  }

  if (err.name === 'ValidationError') {
    return sendError(res, err.message, err.errors, 400);
  }

  if (err.name === 'CastError') {
    return sendError(res, `Invalid resource ID format: ${err.value}`, null, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate value entered for ${field}. It must be unique.`, null, 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, process.env.NODE_ENV === 'development' ? err.stack : undefined, statusCode);
};
