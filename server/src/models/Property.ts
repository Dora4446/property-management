import mongoose, { Schema, Document } from 'mongoose';

export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Office' | 'Land';
export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type AvailabilityStatus = 'Available' | 'Occupied' | 'Under Maintenance';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: PropertyType;
  ownerId: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  assignedAgentId?: mongoose.Types.ObjectId;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number; // in sq ft
  furnishingStatus: FurnishingStatus;
  amenities: string[];
  monthlyRent: number; // INR
  securityDeposit: number; // INR
  images: string[];
  availabilityStatus: AvailabilityStatus;
  currentTenantId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Villa', 'Commercial', 'Office', 'Land'],
      required: true,
      index: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, index: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    builtUpArea: { type: Number, required: true },
    furnishingStatus: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Semi-Furnished',
    },
    amenities: [{ type: String }],
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Occupied', 'Under Maintenance'],
      default: 'Available',
      index: true,
    },
    currentTenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  },
  {
    timestamps: true,
  }
);

export const Property = mongoose.model<IProperty>('Property', PropertySchema);
