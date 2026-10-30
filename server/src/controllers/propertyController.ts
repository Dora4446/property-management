import { Response } from 'express';
import { Property } from '../models/Property';
import { RentalAgreement } from '../models/RentalAgreement';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      propertyType,
      city,
      status,
      furnishing,
      minRent,
      maxRent,
      bedrooms,
      ownerId,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const query: any = {};

    // Role-based scope (owners only see their properties in admin views, unless public query)
    if (req.user && req.user.role === 'PROPERTY_OWNER') {
      query.ownerId = req.user.id;
    } else if (ownerId) {
      query.ownerId = ownerId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { address: { $regex: search as string, $options: 'i' } },
        { city: { $regex: search as string, $options: 'i' } },
        { pincode: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (propertyType) query.propertyType = propertyType;
    if (city) query.city = { $regex: city as string, $options: 'i' };
    if (status) query.availabilityStatus = status;
    if (furnishing) query.furnishingStatus = furnishing;
    if (bedrooms) query.bedrooms = parseInt(bedrooms as string, 10);

    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = parseFloat(minRent as string);
      if (maxRent) query.monthlyRent.$lte = parseFloat(maxRent as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('ownerId', 'name email phone')
        .populate('managerId', 'name email phone')
        .populate('currentTenantId')
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(query),
    ]);

    return sendSuccess(res, 'Properties retrieved successfully', properties, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch properties', null, 500);
  }
};

export const getPropertyById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('managerId', 'name email phone')
      .populate('assignedAgentId', 'name email phone')
      .populate({
        path: 'currentTenantId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      });

    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    return sendSuccess(res, 'Property retrieved successfully', property);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch property details', null, 500);
  }
};

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const propertyData = { ...req.body };

    // Default owner to logged-in user if they are an owner
    if (req.user?.role === 'PROPERTY_OWNER') {
      propertyData.ownerId = req.user.id;
    } else if (!propertyData.ownerId && req.user?.id) {
      propertyData.ownerId = req.user.id;
    }

    const property = new Property(propertyData);
    await property.save();

    return sendSuccess(res, 'Property created successfully', property, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create property', null, 500);
  }
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    // Role-based permission check: Owners can only update their own properties
    if (
      req.user?.role === 'PROPERTY_OWNER' &&
      property.ownerId.toString() !== req.user.id
    ) {
      return sendError(res, 'You are not authorized to update this property', null, 403);
    }

    Object.assign(property, req.body);
    await property.save();

    return sendSuccess(res, 'Property updated successfully', property);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update property', null, 500);
  }
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    // Check if property is currently occupied
    if (property.availabilityStatus === 'Occupied') {
      return sendError(
        res,
        'Cannot delete property: Unit is currently marked as Occupied. Please vacate or terminate active lease first.',
        null,
        400
      );
    }

    // Check if there are active rental agreements
    const activeAgreement = await RentalAgreement.findOne({
      propertyId: property._id,
      agreementStatus: 'Active',
    });

    if (activeAgreement) {
      return sendError(
        res,
        'Cannot delete property: Unit has an active Rental Agreement. Terminate agreement before deletion.',
        null,
        400
      );
    }

    await Property.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 'Property deleted successfully', { id: req.params.id });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to delete property', null, 500);
  }
};
