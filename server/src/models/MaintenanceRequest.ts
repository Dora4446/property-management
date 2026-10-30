import mongoose, { Schema, Document } from 'mongoose';

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
export type MaintenanceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'Appliance' | 'HVAC' | 'Other';

export interface IMaintenanceRequest extends Document {
  ticketNumber: string;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  description: string;
  images: string[];
  status: MaintenanceStatus;
  assignedTechnician?: {
    name: string;
    phone: string;
    assignedDate?: Date;
  };
  estimatedCost: number;
  actualCost: number;
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    category: {
      type: String,
      enum: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Appliance', 'HVAC', 'Other'],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    description: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    assignedTechnician: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      assignedDate: { type: Date },
    },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },
    resolutionNotes: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const MaintenanceRequest = mongoose.model<IMaintenanceRequest>(
  'MaintenanceRequest',
  MaintenanceRequestSchema
);
