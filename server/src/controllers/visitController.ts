import { Response } from 'express';
import { PropertyVisit } from '../models/PropertyVisit';
import { Property } from '../models/Property';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getVisits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, propertyId } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (propertyId) query.propertyId = propertyId;

    if (req.user?.role === 'AGENT') {
      query.agentId = req.user.id;
    }

    const visits = await PropertyVisit.find(query)
      .populate('propertyId', 'title address city monthlyRent')
      .populate('agentId', 'name email phone')
      .sort({ visitDate: -1 });

    return sendSuccess(res, 'Visits retrieved successfully', visits);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch visits', null, 500);
  }
};

export const scheduleVisit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId, visitorName, visitorPhone, visitorEmail, visitDate, visitTime, agentId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return sendError(res, 'Property not found', null, 404);
    }

    const visit = new PropertyVisit({
      propertyId,
      visitorName,
      visitorPhone,
      visitorEmail,
      visitDate: new Date(visitDate),
      visitTime,
      agentId: agentId || property.assignedAgentId,
      status: 'Scheduled',
    });

    await visit.save();

    const populated = await PropertyVisit.findById(visit._id).populate('propertyId');

    return sendSuccess(res, 'Property visit scheduled successfully', populated, undefined, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to schedule visit', null, 500);
  }
};

export const updateVisitStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, feedback } = req.body;
    const visit = await PropertyVisit.findById(req.params.id);

    if (!visit) {
      return sendError(res, 'Visit record not found', null, 404);
    }

    if (status) visit.status = status;
    if (feedback) visit.feedback = feedback;

    await visit.save();

    return sendSuccess(res, 'Visit status updated', visit);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update visit', null, 500);
  }
};
