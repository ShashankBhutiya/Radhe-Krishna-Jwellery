import Razorpay from 'razorpay';
import crypto from 'node:crypto';

export function getRazorpayKeys() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  return { keyId, keySecret, webhookSecret };
}

export function isRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getRazorpayKeys();
  return Boolean(
    keyId &&
      keySecret &&
      !keyId.includes('change-me') &&
      !keySecret.includes('change-me') &&
      keyId.trim().length > 0 &&
      keySecret.trim().length > 0,
  );
}

let instance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay | null {
  if (!isRazorpayConfigured()) return null;
  if (!instance) {
    const { keyId, keySecret } = getRazorpayKeys();
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return instance;
}

/**
 * Validates the cryptographic payment signature returned by the Razorpay Checkout modal.
 * Uses timing-safe string comparison to prevent timing attacks.
 */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  if (!keySecret) return false;

  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');

    if (expected.length !== razorpaySignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf-8'), Buffer.from(razorpaySignature, 'utf-8'));
  } catch {
    return false;
  }
}

/**
 * Validates the webhook signature from the X-Razorpay-Signature header.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayKeys();
  if (!webhookSecret) return false;

  try {
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf-8'), Buffer.from(signature, 'utf-8'));
  } catch {
    return false;
  }
}
