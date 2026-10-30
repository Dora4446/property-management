import { Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role, status, search, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { phone: { $regex: search as string, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 'Users fetched successfully', users, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch users', null, 500);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }
    return sendSuccess(res, 'User fetched successfully', user);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user', null, 500);
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return sendError(res, 'Status must be ACTIVE or INACTIVE', null, 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    return sendSuccess(res, `User status updated to ${status}`, user);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update user status', null, 500);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }
    return sendSuccess(res, 'User deleted successfully', { id: req.params.id });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete user', null, 500);
  }
};
