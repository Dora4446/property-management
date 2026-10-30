import { Response } from 'express';
import { MaintenanceRequest } from '../models/MaintenanceRequest';
import { Tenant } from '../models/Tenant';
import { Property } from '../models/Property';
import { Expense } from '../models/Expense';
import { Notification } from '../models/Notification';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getMaintenanceRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, priority, category, propertyId, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (propertyId) query.propertyId = propertyId;

    // Tenant role filter
    if (req.user?.role === 'TENANT') {
      const tenantDoc = await Tenant.findOne({ userId: req.user.id });
      if (!tenantDoc) return sendSuccess(res, 'No tickets found', []);
      query.tenantId = tenantDoc._id;
    }

    // Owner role filter
    if (req.user?.role === 'PROPERTY_OWNER') {
      const ownerProperties = await Property.find({ ownerId: req.user.id }).select('_id');
      const propIds = ownerProperties.map((p) => p._id);
      query.propertyId = { $in: propIds };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(query)
        .populate('propertyId', 'title address city')
        .populate({
          path: 'tenantId',
          populate: { path: 'userId', select: 'name email phone avatar' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      MaintenanceRequest.countDocuments(query),
    ]);

    return sendSuccess(res, 'Maintenance requests fetched successfully', requests, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch maintenance requests', null, 500);
  }
};

export const getMaintenanceRequestById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('propertyId')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone avatar' },
      });

    if (!request) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    return sendSuccess(res, 'Maintenance request fetched successfully', request);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch maintenance request', null, 500);
  }
};

export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId, category, priority, description, images } = req.body;

    let tenantId = req.body.tenantId;

    if (req.user?.role === 'TENANT') {
      const tenantDoc = await Tenant.findOne({ userId: req.user.id });
      if (!tenantDoc) {
        return sendError(res, 'Tenant profile not found for user', null, 400);
      }
      tenantId = tenantDoc._id;
    }

    const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = new MaintenanceRequest({
      ticketNumber,
      propertyId,
      tenantId,
      category,
      priority: priority || 'Medium',
      description,
      images: images || [],
      status: 'Open',
    });

    await ticket.save();

    // Notify owner
    const prop = await Property.findById(propertyId);
    if (prop?.ownerId) {
      await Notification.create({
        recipientId: prop.ownerId,
        title: 'New Maintenance Request',
        message: `Ticket ${ticket.ticketNumber} opened for ${prop.title}: ${category} - ${priority} priority`,
        type: 'MAINTENANCE_UPDATE',
        linkUrl: `/maintenance/${ticket._id}`,
      });
    }

    const populatedTicket = await MaintenanceRequest.findById(ticket._id)
      .populate('propertyId', 'title address city')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    return sendSuccess(res, 'Maintenance ticket raised successfully', populatedTicket, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create maintenance ticket', null, 500);
  }
};

export const updateMaintenanceStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTechnician, estimatedCost, actualCost, resolutionNotes } = req.body;

    const ticket = await MaintenanceRequest.findById(id).populate({
      path: 'tenantId',
      populate: { path: 'userId', select: '_id name' },
    });

    if (!ticket) {
      return sendError(res, 'Ticket not found', null, 404);
    }

    if (status) ticket.status = status;
    if (assignedTechnician) ticket.assignedTechnician = assignedTechnician;
    if (estimatedCost !== undefined) ticket.estimatedCost = estimatedCost;
    if (actualCost !== undefined) ticket.actualCost = actualCost;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;

    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolvedAt = new Date();

      // If actualCost > 0, automatically record as an expense
      if (actualCost && actualCost > 0) {
        await Expense.create({
          propertyId: ticket.propertyId,
          category: 'Maintenance',
          title: `Maintenance Resolution: ${ticket.ticketNumber} (${ticket.category})`,
          amount: actualCost,
          expenseDate: new Date(),
          paidTo: ticket.assignedTechnician?.name || 'Technician',
          paymentMethod: 'Net Banking',
          notes: resolutionNotes || `Auto-recorded from ticket ${ticket.ticketNumber}`,
          createdBy: req.user?.id,
        });
      }
    }

    await ticket.save();

    // Notify tenant of update
    const tenantUser = (ticket.tenantId as any)?.userId;
    if (tenantUser?._id) {
      await Notification.create({
        recipientId: tenantUser._id,
        title: `Maintenance Ticket ${ticket.status}`,
        message: `Your ticket ${ticket.ticketNumber} status has changed to: ${ticket.status}.`,
        type: 'MAINTENANCE_UPDATE',
        linkUrl: `/maintenance/${ticket._id}`,
      });
    }

    return sendSuccess(res, 'Maintenance ticket updated successfully', ticket);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update maintenance request', null, 500);
  }
};
