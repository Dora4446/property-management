import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user?.id,
      isRead: false,
    });

    return sendSuccess(res, 'Notifications retrieved', { notifications, unreadCount });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch notifications', null, 500);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ recipientId: req.user?.id, isRead: false }, { isRead: true });
      return sendSuccess(res, 'All notifications marked as read');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user?.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', null, 404);
    }

    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update notification', null, 500);
  }
};
