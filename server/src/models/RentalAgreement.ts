import mongoose, { Schema, Document } from 'mongoose';

export type AgreementStatus = 'Draft' | 'Active' | 'Expired' | 'Terminated';

export interface IRentalAgreement extends Document {
  agreementNumber: string;
  propertyId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  leaseStartDate: Date;
  leaseEndDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  paymentDueDay: number; // Day of month e.g., 5th
  agreementStatus: AgreementStatus;
  termsAndConditions: string;
  documentUrl?: string;
  renewedFromId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RentalAgreementSchema = new Schema<IRentalAgreement>(
  {
    agreementNumber: { type: String, required: true, unique: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    leaseStartDate: { type: Date, required: true },
    leaseEndDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    paymentDueDay: { type: Number, default: 5, min: 1, max: 31 },
    agreementStatus: {
      type: String,
      enum: ['Draft', 'Active', 'Expired', 'Terminated'],
      default: 'Active',
      index: true,
    },
    termsAndConditions: { type: String, default: 'Standard 11-month Indian residential tenancy agreement.' },
    documentUrl: { type: String, default: '' },
    renewedFromId: { type: Schema.Types.ObjectId, ref: 'RentalAgreement' },
  },
  {
    timestamps: true,
  }
);

export const RentalAgreement = mongoose.model<IRentalAgreement>('RentalAgreement', RentalAgreementSchema);
