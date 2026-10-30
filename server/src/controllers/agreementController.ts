import { Response } from 'express';
import { RentalAgreement } from '../models/RentalAgreement';
import { Property } from '../models/Property';
import { Tenant } from '../models/Tenant';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getAgreements = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, propertyId, tenantId, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status) query.agreementStatus = status;
    if (propertyId) query.propertyId = propertyId;
    if (tenantId) query.tenantId = tenantId;

    // Scope for Tenant
    if (req.user?.role === 'TENANT') {
      const tenantDoc = await Tenant.findOne({ userId: req.user.id });
      if (!tenantDoc) return sendSuccess(res, 'No agreements found', []);
      query.tenantId = tenantDoc._id;
    }

    // Scope for Owner
    if (req.user?.role === 'PROPERTY_OWNER') {
      query.ownerId = req.user.id;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [agreements, total] = await Promise.all([
      RentalAgreement.find(query)
        .populate('propertyId', 'title address city monthlyRent securityDeposit')
        .populate('ownerId', 'name email phone')
        .populate({
          path: 'tenantId',
          populate: { path: 'userId', select: 'name email phone avatar' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RentalAgreement.countDocuments(query),
    ]);

    return sendSuccess(res, 'Agreements retrieved successfully', agreements, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch agreements', null, 500);
  }
};

export const getAgreementById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agreement = await RentalAgreement.findById(req.params.id)
      .populate('propertyId')
      .populate('ownerId', 'name email phone address')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      });

    if (!agreement) {
      return sendError(res, 'Rental agreement not found', null, 404);
    }

    return sendSuccess(res, 'Rental agreement retrieved successfully', agreement);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch agreement', null, 500);
  }
};

export const createAgreement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      propertyId,
      tenantId,
      leaseStartDate,
      leaseEndDate,
      monthlyRent,
      securityDeposit,
      paymentDueDay,
      termsAndConditions,
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    // Invariant check: Ensure property does not already have an active agreement
    const existingActive = await RentalAgreement.findOne({
      propertyId,
      agreementStatus: 'Active',
    });

    if (existingActive) {
      return sendError(
        res,
        'This property already has an active lease agreement. Please terminate or renew the existing agreement first.',
        null,
        400
      );
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return sendError(res, 'Tenant profile not found', null, 404);
    }

    const agreementNumber = `AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const agreement = new RentalAgreement({
      agreementNumber,
      propertyId,
      ownerId: property.ownerId,
      tenantId,
      leaseStartDate,
      leaseEndDate,
      monthlyRent: monthlyRent || property.monthlyRent,
      securityDeposit: securityDeposit || property.securityDeposit,
      paymentDueDay: paymentDueDay || 5,
      termsAndConditions,
      agreementStatus: 'Active',
    });

    await agreement.save();

    // Mark property as Occupied and assign tenant
    property.availabilityStatus = 'Occupied';
    property.currentTenantId = tenant._id as any;
    await property.save();

    // Update tenant lease dates
    tenant.propertyId = property._id as any;
    tenant.leaseStartDate = new Date(leaseStartDate);
    tenant.leaseEndDate = new Date(leaseEndDate);
    tenant.status = 'Active';
    await tenant.save();

    const populatedAgreement = await RentalAgreement.findById(agreement._id)
      .populate('propertyId')
      .populate('ownerId', 'name email phone')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    return sendSuccess(res, 'Rental agreement created successfully', populatedAgreement, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create agreement', null, 500);
  }
};

export const renewAgreement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newEndDate, newMonthlyRent } = req.body;

    const currentAgreement = await RentalAgreement.findById(id);
    if (!currentAgreement) {
      return sendError(res, 'Rental agreement not found', null, 404);
    }

    // Create renewed agreement
    const renewedAgreement = new RentalAgreement({
      agreementNumber: `AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: currentAgreement.propertyId,
      ownerId: currentAgreement.ownerId,
      tenantId: currentAgreement.tenantId,
      leaseStartDate: currentAgreement.leaseEndDate,
      leaseEndDate: new Date(newEndDate),
      monthlyRent: newMonthlyRent || currentAgreement.monthlyRent,
      securityDeposit: currentAgreement.securityDeposit,
      paymentDueDay: currentAgreement.paymentDueDay,
      termsAndConditions: currentAgreement.termsAndConditions,
      agreementStatus: 'Active',
      renewedFromId: currentAgreement._id,
    });

    currentAgreement.agreementStatus = 'Expired';
    await currentAgreement.save();
    await renewedAgreement.save();

    return sendSuccess(res, 'Agreement renewed successfully', renewedAgreement);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to renew agreement', null, 500);
  }
};

export const terminateAgreement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agreement = await RentalAgreement.findById(req.params.id);
    if (!agreement) {
      return sendError(res, 'Agreement not found', null, 404);
    }

    agreement.agreementStatus = 'Terminated';
    await agreement.save();

    // Release property
    await Property.findByIdAndUpdate(agreement.propertyId, {
      availabilityStatus: 'Available',
      currentTenantId: null,
    });

    // Update tenant status
    await Tenant.findByIdAndUpdate(agreement.tenantId, {
      status: 'Inactive',
      propertyId: null,
    });

    return sendSuccess(res, 'Agreement terminated and property marked available', agreement);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to terminate agreement', null, 500);
  }
};
