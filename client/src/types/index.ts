export type UserRole = 'ADMIN' | 'PROPERTY_OWNER' | 'PROPERTY_MANAGER' | 'AGENT' | 'TENANT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  _id: string;
  name: string;
  email: string;
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
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Office' | 'Land';
export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type AvailabilityStatus = 'Available' | 'Occupied' | 'Under Maintenance';

export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  ownerId: User | string;
  managerId?: User | string;
  assignedAgentId?: User | string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bedrooms: number;
  bathrooms: number;
  builtUpArea: number;
  furnishingStatus: FurnishingStatus;
  amenities: string[];
  monthlyRent: number;
  securityDeposit: number;
  images: string[];
  availabilityStatus: AvailabilityStatus;
  currentTenantId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  _id: string;
  userId: User;
  propertyId?: Property;
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
    idNumber: string;
    isVerified: boolean;
  };
  status: 'Active' | 'Inactive' | 'Pending';
  leaseStartDate?: string;
  leaseEndDate?: string;
  createdAt: string;
}

export interface RentalAgreement {
  _id: string;
  agreementNumber: string;
  propertyId: Property;
  ownerId: User;
  tenantId: Tenant;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  securityDeposit: number;
  paymentDueDay: number;
  agreementStatus: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  termsAndConditions: string;
  documentUrl?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  invoiceNumber: string;
  agreementId: RentalAgreement | string;
  propertyId: Property;
  tenantId: Tenant;
  amount: number;
  paymentMonth: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: 'Razorpay' | 'UPI' | 'Net Banking' | 'Cash' | 'Card';
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  transactionReference?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  _id: string;
  ticketNumber: string;
  propertyId: Property;
  tenantId: Tenant;
  category: 'Plumbing' | 'Electrical' | 'Carpentry' | 'Painting' | 'Appliance' | 'HVAC' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  images: string[];
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTechnician?: {
    name: string;
    phone: string;
    assignedDate?: string;
  };
  estimatedCost: number;
  actualCost: number;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  propertyId: Property;
  category: 'Maintenance' | 'Utility' | 'Property Tax' | 'Insurance' | 'Management Fee' | 'Legal & Compliance' | 'Other';
  title: string;
  amount: number;
  expenseDate: string;
  paidTo: string;
  paymentMethod: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface PropertyVisit {
  _id: string;
  propertyId: Property;
  agentId?: User;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  visitDate: string;
  visitTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedback?: string;
}

export interface ActivityLog {
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}
