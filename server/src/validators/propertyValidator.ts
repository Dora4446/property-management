import { z } from 'zod';

export const propertySchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    propertyType: z.enum(['Apartment', 'House', 'Villa', 'Commercial', 'Office', 'Land']),
    ownerId: z.string().optional(),
    managerId: z.string().optional(),
    assignedAgentId: z.string().optional(),
    address: z.string().min(3, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().min(6, 'Valid 6-digit Indian PIN code is required'),
    bedrooms: z.number().int().min(0).default(1),
    bathrooms: z.number().int().min(0).default(1),
    builtUpArea: z.number().positive('Built up area must be greater than 0 sq ft'),
    furnishingStatus: z.enum(['Furnished', 'Semi-Furnished', 'Unfurnished']).default('Semi-Furnished'),
    amenities: z.array(z.string()).default([]),
    monthlyRent: z.number().positive('Monthly rent must be a positive amount in INR'),
    securityDeposit: z.number().nonnegative('Security deposit must be >= 0'),
    images: z.array(z.string()).default([]),
    availabilityStatus: z.enum(['Available', 'Occupied', 'Under Maintenance']).default('Available'),
  }),
});
