import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'PROPERTY_OWNER' | 'PROPERTY_MANAGER' | 'AGENT' | 'TENANT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  status: UserStatus;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['ADMIN', 'PROPERTY_OWNER', 'PROPERTY_MANAGER', 'AGENT', 'TENANT'],
      default: 'TENANT',
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
