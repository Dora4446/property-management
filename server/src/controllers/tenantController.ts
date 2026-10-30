import { Response } from 'express';
import { Tenant } from '../models/Tenant';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getAllTenants = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, propertyId, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (propertyId) query.propertyId = propertyId;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tenants, total] = await Promise.all([
      Tenant.find(query)
        .populate('userId', 'name email phone avatar status')
        .populate('propertyId', 'title address city monthlyRent availabilityStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Tenant.countDocuments(query),
    ]);

    // Optional text search filter on populated user name/email
    let results = tenants;
    if (search) {
      const s = (search as string).toLowerCase();
      results = tenants.filter((t: any) => {
        const nameMatch = t.userId?.name?.toLowerCase().includes(s);
        const emailMatch = t.userId?.email?.toLowerCase().includes(s);
        const phoneMatch = t.emergencyContact?.phone?.includes(s);
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    return sendSuccess(res, 'Tenants retrieved successfully', results, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch tenants', null, 500);
  }
};

export const getTenantById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('userId', 'name email phone avatar status')
      .populate('propertyId');

    if (!tenant) {
      return sendError(res, 'Tenant profile not found', null, 404);
    }

    return sendSuccess(res, 'Tenant retrieved successfully', tenant);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch tenant', null, 500);
  }
};

export const createTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      propertyId,
      emergencyContact,
      employmentDetails,
      identityProof,
      leaseStartDate,
      leaseEndDate,
    } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new tenant user account with default credentials
      user = new User({
        name,
        email: email.toLowerCase(),
        password: 'Password@123', // Default initial password for tenant
        phone,
        role: 'TENANT',
      });
      await user.save();
    }

    const existingTenant = await Tenant.findOne({ userId: user._id });
    if (existingTenant) {
      return sendError(res, 'A tenant profile for this user already exists.', null, 400);
    }

    const tenant = new Tenant({
      userId: user._id,
      propertyId,
      emergencyContact,
      employmentDetails,
      identityProof,
      leaseStartDate,
      leaseEndDate,
      status: 'Active',
    });

    await tenant.save();

    // If assigned to a property, update property status
    if (propertyId) {
      await Property.findByIdAndUpdate(propertyId, {
        availabilityStatus: 'Occupied',
        currentTenantId: tenant._id,
      });
    }

    const populatedTenant = await Tenant.findById(tenant._id)
      .populate('userId', 'name email phone avatar')
      .populate('propertyId', 'title address city monthlyRent');

    return sendSuccess(res, 'Tenant registered successfully', populatedTenant, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create tenant', null, 500);
  }
};

export const updateTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate('userId', 'name email phone')
      .populate('propertyId');

    if (!tenant) {
      return sendError(res, 'Tenant not found', null, 404);
    }

    return sendSuccess(res, 'Tenant profile updated successfully', tenant);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update tenant', null, 500);
  }
};

export const assignTenantProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tenantId, propertyId } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Tenant not found', null, 404);
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    if (property.availabilityStatus === 'Occupied' && property.currentTenantId?.toString() !== tenantId) {
      return sendError(res, 'This property is already occupied by another tenant.', null, 400);
    }

    tenant.propertyId = property._id as any;
    tenant.status = 'Active';
    await tenant.save();

    property.availabilityStatus = 'Occupied';
    property.currentTenantId = tenant._id as any;
    await property.save();

    return sendSuccess(res, 'Tenant assigned to property successfully', { tenant, property });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to assign property', null, 500);
  }
};
