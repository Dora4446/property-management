import { Router } from 'express';
import {
  getPayments,
  getPaymentById,
  generateMonthlyInvoices,
  createRazorpayCheckoutOrder,
  verifyPaymentConfirmation,
  recordManualPayment,
  downloadReceiptPdf,
  handleRazorpayWebhook,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';

const router = Router();

// Public webhook route (called directly by Razorpay servers)
router.post('/webhook', handleRazorpayWebhook);

// Protected routes requiring user authentication
router.use(authenticate);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.get('/:id/receipt', downloadReceiptPdf);

router.post(
  '/generate-monthly',
  authorize('ADMIN', 'PROPERTY_MANAGER'),
  generateMonthlyInvoices
);

router.post('/checkout-order', createRazorpayCheckoutOrder);
router.post('/verify', verifyPaymentConfirmation);
router.post('/manual-record', authorize('ADMIN', 'PROPERTY_MANAGER'), recordManualPayment);

export default router;
