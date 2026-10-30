import mongoose, { Schema, Document } from 'mongoose';

export type TenantStatus = 'Active' | 'Inactive' | 'Pending';

export interface ITenant extends Document {
  userId: mongoose.Types.ObjectId; // User account reference
  propertyId?: mongoose.Types.ObjectId; // Current assigned property
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  employmentDetails?: {
    employerName?: string;
    designation?: string;
    monthlyIncome?: number;
  };
  identityProof?: {
    idType: 'Aadhaar' | 'PAN' | 'Passport' | 'VoterID';
    idNumber: string; // Stored securely
    isVerified: boolean;
  };
  status: TenantStatus;
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', index: true },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    employmentDetails: {
      employerName: { type: String, default: '' },
      designation: { type: String, default: '' },
      monthlyIncome: { type: Number, default: 0 },
    },
    identityProof: {
      idType: { type: String, enum: ['Aadhaar', 'PAN', 'Passport', 'VoterID'], default: 'Aadhaar' },
      idNumber: { type: String, default: '' },
      isVerified: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Active',
      index: true,
    },
    leaseStartDate: { type: Date },
    leaseEndDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
