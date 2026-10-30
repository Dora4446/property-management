import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory =
  | 'Maintenance'
  | 'Utility'
  | 'Property Tax'
  | 'Insurance'
  | 'Management Fee'
  | 'Legal & Compliance'
  | 'Other';

export interface IExpense extends Document {
  propertyId: mongoose.Types.ObjectId;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expenseDate: Date;
  paidTo: string;
  paymentMethod: string;
  receiptUrl?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    category: {
      type: String,
      enum: [
        'Maintenance',
        'Utility',
        'Property Tax',
        'Insurance',
        'Management Fee',
        'Legal & Compliance',
        'Other',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true, index: true },
    paidTo: { type: String, required: true },
    paymentMethod: { type: String, default: 'Net Banking' },
    receiptUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
