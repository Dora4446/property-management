import mongoose, { Schema, Document } from 'mongoose';

export type VisitStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface IPropertyVisit extends Document {
  propertyId: mongoose.Types.ObjectId;
  agentId?: mongoose.Types.ObjectId;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  visitDate: Date;
  visitTime: string;
  status: VisitStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyVisitSchema = new Schema<IPropertyVisit>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    visitorName: { type: String, required: true },
    visitorPhone: { type: String, required: true },
    visitorEmail: { type: String, default: '' },
    visitDate: { type: Date, required: true, index: true },
    visitTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
      index: true,
    },
    feedback: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const PropertyVisit = mongoose.model<IPropertyVisit>('PropertyVisit', PropertyVisitSchema);
