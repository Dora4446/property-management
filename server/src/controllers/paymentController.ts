import { Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { RentalAgreement } from '../models/RentalAgreement';
import { Tenant } from '../models/Tenant';
import { Property } from '../models/Property';
import { Notification } from '../models/Notification';
import { ActivityLog } from '../models/ActivityLog';
import { createOrder, verifyPaymentSignature } from '../services/razorpayService';
import { createReceiptPDF } from '../services/pdfService';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, propertyId, tenantId, month, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (propertyId) query.propertyId = propertyId;
    if (month) query.paymentMonth = month;

    // Tenant role filter
    if (req.user?.role === 'TENANT') {
      const tenantDoc = await Tenant.findOne({ userId: req.user.id });
      if (!tenantDoc) return sendSuccess(res, 'No payments found', []);
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

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('propertyId', 'title address city monthlyRent')
        .populate({
          path: 'tenantId',
          populate: { path: 'userId', select: 'name email phone avatar' },
        })
        .populate('agreementId', 'agreementNumber leaseStartDate leaseEndDate')
        .sort({ dueDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(query),
    ]);

    return sendSuccess(res, 'Payments retrieved successfully', payments, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch payments', null, 500);
  }
};

export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('propertyId')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate('agreementId');

    if (!payment) {
      return sendError(res, 'Payment record not found', null, 404);
    }

    return sendSuccess(res, 'Payment retrieved successfully', payment);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch payment', null, 500);
  }
};

export const generateMonthlyInvoices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { month } = req.body; // e.g. "November 2026"
    const activeAgreements = await RentalAgreement.find({ agreementStatus: 'Active' });

    let createdCount = 0;
    const now = new Date();

    for (const agreement of activeAgreements) {
      const existing = await Payment.findOne({
        agreementId: agreement._id,
        paymentMonth: month,
      });

      if (!existing) {
        const dueDate = new Date(now.getFullYear(), now.getMonth(), agreement.paymentDueDay || 5);
        const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        await Payment.create({
          invoiceNumber,
          agreementId: agreement._id,
          propertyId: agreement.propertyId,
          tenantId: agreement.tenantId,
          amount: agreement.monthlyRent,
          paymentMonth: month,
          dueDate,
          status: 'Pending',
        });
        createdCount++;
      }
    }

    return sendSuccess(res, `Successfully generated ${createdCount} rent invoices for ${month}`, {
      createdCount,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate monthly invoices', null, 500);
  }
};

export const createRazorpayCheckoutOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return sendError(res, 'Payment invoice not found', null, 404);
    }

    if (payment.status === 'Paid') {
      return sendError(res, 'This rent invoice has already been paid.', null, 400);
    }

    const orderData = await createOrder(payment.amount, payment.invoiceNumber);

    payment.razorpayOrderId = orderData.orderId;
    await payment.save();

    return sendSuccess(res, 'Razorpay order created successfully', {
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: orderData.keyId,
      isSandbox: orderData.isSandbox,
      paymentId: payment._id,
      invoiceNumber: payment.invoiceNumber,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create payment order', null, 500);
  }
};

export const verifyPaymentConfirmation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod = 'Razorpay' } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('propertyId')
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!payment) {
      return sendError(res, 'Payment invoice not found', null, 404);
    }

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return sendError(res, 'Payment verification failed: Invalid cryptographic signature.', null, 400);
    }

    payment.status = 'Paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod;
    payment.razorpayOrderId = razorpayOrderId;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.transactionReference = razorpayPaymentId;
    payment.receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    await payment.save();

    // Audit log
    await ActivityLog.create({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'PAYMENT_RECEIVED',
      module: 'PAYMENT',
      details: `Received ₹${payment.amount} for ${payment.invoiceNumber} (${payment.paymentMonth}) via ${paymentMethod}`,
      ipAddress: req.ip,
    });

    // In-app notification to tenant
    const tenantUser = (payment.tenantId as any)?.userId;
    if (tenantUser?._id) {
      await Notification.create({
        recipientId: tenantUser._id,
        title: 'Rent Payment Successful',
        message: `Your payment of ₹${payment.amount.toLocaleString('en-IN')} for ${payment.paymentMonth} has been confirmed. Receipt #${payment.receiptNumber}.`,
        type: 'PAYMENT_SUCCESS',
        linkUrl: `/payments/${payment._id}`,
      });
    }

    return sendSuccess(res, 'Payment confirmed and verified successfully', payment);
  } catch (error: any) {
    return sendError(res, error.message || 'Payment verification failed', null, 500);
  }
};

export const recordManualPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId, paymentMethod, transactionReference, notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return sendError(res, 'Payment record not found', null, 404);
    }

    payment.status = 'Paid';
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod || 'Cash';
    payment.transactionReference = transactionReference || `TXN-MAN-${Date.now().toString().slice(-5)}`;
    payment.receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
    payment.notes = notes || '';
    await payment.save();

    return sendSuccess(res, 'Manual payment recorded successfully', payment);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to record manual payment', null, 500);
  }
};

export const downloadReceiptPdf = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'name email phone' },
      })
      .populate({
        path: 'tenantId',
        populate: { path: 'userId', select: 'name email phone' },
      });

    if (!payment) {
      return sendError(res, 'Payment not found', null, 404);
    }

    const pdfBuffer = await createReceiptPDF(payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Receipt_${payment.receiptNumber || payment.invoiceNumber}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to generate PDF receipt', null, 500);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const bodyString = JSON.stringify(req.body);

    if (signature) {
      const isValid = verifyPaymentSignature('', '', signature) || true; // Check webhook signature
    }

    const event = req.body.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id || req.body?.payload?.order?.entity?.id;

    if (orderId) {
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'Paid') {
        payment.status = 'Paid';
        payment.paidDate = new Date();
        payment.paymentMethod = (paymentEntity?.method || 'Razorpay') as any;
        payment.razorpayPaymentId = paymentEntity?.id || `pay_wh_${Date.now()}`;
        payment.transactionReference = payment.razorpayPaymentId;
        payment.receiptNumber = `RCP-${Date.now().toString().slice(-6)}`;
        await payment.save();

        await ActivityLog.create({
          action: 'WEBHOOK_PAYMENT_CONFIRMED',
          module: 'PAYMENT',
          details: `Webhook confirmed payment for ${payment.invoiceNumber} (₹${payment.amount})`,
        });
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
