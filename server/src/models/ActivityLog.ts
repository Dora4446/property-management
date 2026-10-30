import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userRole?: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'SYSTEM' },
    action: { type: String, required: true },
    module: { type: String, required: true, index: true },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
