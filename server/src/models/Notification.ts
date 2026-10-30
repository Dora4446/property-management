import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'RENT_DUE'
  | 'PAYMENT_SUCCESS'
  | 'LEASE_EXPIRY'
  | 'LEASE_RENEWAL'
  | 'MAINTENANCE_UPDATE'
  | 'PROPERTY_ASSIGNED'
  | 'NEW_TENANT'
  | 'GENERAL';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'RENT_DUE',
        'PAYMENT_SUCCESS',
        'LEASE_EXPIRY',
        'LEASE_RENEWAL',
        'MAINTENANCE_UPDATE',
        'PROPERTY_ASSIGNED',
        'NEW_TENANT',
        'GENERAL',
      ],
      default: 'GENERAL',
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    linkUrl: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
