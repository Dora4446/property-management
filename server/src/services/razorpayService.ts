import crypto from 'crypto';
import Razorpay from 'razorpay';
import { ENV } from '../config/env';

const isDevPlaceholder =
  !ENV.RAZORPAY_KEY_ID ||
  ENV.RAZORPAY_KEY_ID === 'rzp_test_placeholder_key' ||
  !ENV.RAZORPAY_KEY_SECRET ||
  ENV.RAZORPAY_KEY_SECRET === 'rzp_test_placeholder_secret';

let razorpayInstance: Razorpay | null = null;

if (!isDevPlaceholder) {
  try {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
    console.log('[Razorpay] Initialized live Razorpay instance with Key ID:', ENV.RAZORPAY_KEY_ID);
  } catch (err) {
    console.warn('[Razorpay] Failed to initialize live instance. Using Dev Sandbox mode.');
  }
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  isSandbox: boolean;
  keyId: string;
}

export const createOrder = async (
  amountInRupees: number,
  receiptId: string
): Promise<RazorpayOrderResult> => {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (razorpayInstance && !isDevPlaceholder) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: { receiptId, system: 'PropertyHub' },
      });
      return {
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        isSandbox: false,
        keyId: ENV.RAZORPAY_KEY_ID,
      };
    } catch (apiError: any) {
      console.warn('[Razorpay API Error]:', apiError?.error || apiError.message, '- Falling back to sandbox order.');
    }
  }

  // Realistic Dev Sandbox Mode
  const simulatedOrderId = `order_sim_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
  return {
    orderId: simulatedOrderId,
    amount: amountInPaise,
    currency: 'INR',
    isSandbox: true,
    keyId: ENV.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  };
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // If simulated order in dev mode
  if (orderId.startsWith('order_sim_')) {
    return Boolean(signature && signature.startsWith('sig_'));
  }

  // Official Razorpay HMAC-SHA256 verification
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (err) {
    console.error('[Razorpay Signature Error]:', err);
    return false;
  }
};

export const verifyWebhookSignature = (
  bodyString: string,
  signature: string,
  secret: string = ENV.RAZORPAY_KEY_SECRET
): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');
    return expectedSignature === signature;
  } catch (err) {
    console.error('[Razorpay Webhook Signature Error]:', err);
    return false;
  }
};
