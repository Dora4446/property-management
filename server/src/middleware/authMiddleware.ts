import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { AuthenticatedRequest, AuthUserPayload } from '../types';
import { sendError } from '../utils/apiResponse';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', null, 401);
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthUserPayload;

    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User associated with this token no longer exists.', null, 401);
    }

    if (user.status === 'INACTIVE') {
      return sendError(res, 'Your account has been deactivated. Please contact administrator.', null, 403);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please login again.', null, 401);
    }
    return sendError(res, 'Invalid authentication token.', null, 401);
  }
};
