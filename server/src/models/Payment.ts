import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
export type PaymentMethod = 'Razorpay' | 'UPI' | 'Net Banking' | 'Cash' | 'Card';

export interface IPayment extends Document {
  invoiceNumber: string;
  agreementId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  amount: number;
  paymentMonth: string; // e.g. "October 2026"
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  transactionReference?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    agreementId: { type: Schema.Types.ObjectId, ref: 'RentalAgreement', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMonth: { type: String, required: true },
    dueDate: { type: Date, required: true, index: true },
    paidDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'UPI', 'Net Banking', 'Cash', 'Card'],
      default: 'Razorpay',
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue', 'Partially Paid'],
      default: 'Pending',
      index: true,
    },
    transactionReference: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    receiptNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
