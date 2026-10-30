import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  meta?: any,
  error?: any
) => {
  const payload: ApiResponse<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
    ...(error !== undefined && { error }),
  };
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(res: Response, message: string, data?: T, meta?: any, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

export const sendError = (res: Response, message: string, error?: any, statusCode = 400) => {
  return sendResponse(res, statusCode, false, message, undefined, undefined, error);
};
