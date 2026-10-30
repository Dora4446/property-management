import { Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/apiResponse';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access. Please login.', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
        null,
        403
      );
    }

    return next();
  };
};
