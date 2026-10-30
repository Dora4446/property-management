import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Tenant } from '../models/Tenant';
import { ActivityLog } from '../models/ActivityLog';
import { ENV } from '../config/env';
import { AuthenticatedRequest, AuthUserPayload } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

const generateTokens = (user: IUser) => {
  const payload: AuthUserPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });

  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', null, 409);
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'TENANT',
      address,
    });

    await user.save();

    // If tenant role, automatically create corresponding Tenant document
    if (user.role === 'TENANT') {
      await Tenant.create({
        userId: user._id,
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Relative',
          phone,
        },
        status: 'Active',
      });
    }

    // Audit log
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      module: 'AUTH',
      details: `New ${user.role} account created for ${user.email}`,
      ipAddress: req.ip,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      status: user.status,
    };

    return sendSuccess(
      res,
      'Registration successful. Welcome to PropertyHub!',
      { user: userResponse, accessToken, refreshToken },
      undefined,
      201
    );
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', null, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password credentials.', null, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials.', null, 401);
    }

    if (user.status === 'INACTIVE') {
      return sendError(res, 'This account has been deactivated. Please contact administrator.', null, 403);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      module: 'AUTH',
      details: `User ${user.email} logged in successfully`,
      ipAddress: req.ip,
    });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      status: user.status,
    };

    return sendSuccess(res, 'Login successful', {
      user: userResponse,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', null, 500);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    let tenantProfile = null;
    if (user.role === 'TENANT') {
      tenantProfile = await Tenant.findOne({ userId: user._id }).populate('propertyId');
    }

    return sendSuccess(res, 'User profile retrieved successfully', {
      user,
      tenantProfile,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch profile', null, 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update profile', null, 500);
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', null, 400);
    }

    const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as AuthUserPayload;
    const user = await User.findById(decoded.id);

    if (!user || user.status === 'INACTIVE') {
      return sendError(res, 'Invalid or expired session. Please login again.', null, 401);
    }

    const tokens = generateTokens(user);

    return sendSuccess(res, 'Token refreshed successfully', tokens);
  } catch (error: any) {
    return sendError(res, 'Invalid or expired refresh token', null, 401);
  }
};
