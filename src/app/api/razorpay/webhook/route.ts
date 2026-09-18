import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: rzpOrderId },
          data: {
            paymentStatus: 'PAID',
            razorpayPaymentId: rzpPaymentId || undefined,
          },
        });
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      if (rzpOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: rzpOrderId },
          data: {
            paymentStatus: 'FAILED',
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
