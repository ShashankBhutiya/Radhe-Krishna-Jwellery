import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayInstance, getRazorpayKeys, isRazorpayConfigured } from '@/lib/razorpay';
import { z } from 'zod';

const schema = z.object({
  items: z.array(z.object({ id: z.string(), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional().default(''),
  customerName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 });
    }

    const { items, couponCode, customerName, email, phone } = parsed.data;
    const ids = items.map((i) => i.id);

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, name: true, price: true, stock: true },
    });

    if (products.length !== ids.length) {
      return NextResponse.json({ error: 'Some pieces in your bag are no longer available.' }, { status: 400 });
    }

    const map = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    for (const item of items) {
      const product = map.get(item.id)!;
      if (product.stock < item.qty) {
        return NextResponse.json(
          { error: `Only ${product.stock} available for "${product.name}". Please update your quantity.` },
          { status: 400 },
        );
      }
      subtotal += product.price * item.qty;
    }

    let discount = 0;
    if (couponCode.trim()) {
      const normalised = couponCode.toUpperCase().trim();
      const coupon = await prisma.coupon.findUnique({ where: { code: normalised } });
      if (coupon && coupon.active && subtotal >= coupon.minOrder) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
          if (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) {
            discount = coupon.type === 'PERCENT' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
            if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
            discount = Math.min(discount, subtotal);
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    const amountInPaise = Math.round(total * 100);

    // If Razorpay keys are not configured yet, notify client to run in simulation mode
    if (!isRazorpayConfigured()) {
      return NextResponse.json({
        ok: true,
        isConfigured: false,
        simulated: true,
        amount: amountInPaise,
        currency: 'INR',
        total,
        subtotal,
        discount,
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ error: 'Payment service initialization failed' }, { status: 500 });
    }

    const receipt = `rk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        customerName: customerName || '',
        email: email || '',
        phone: phone || '',
        itemsCount: String(items.length),
      },
    });

    const { keyId } = getRazorpayKeys();

    return NextResponse.json({
      ok: true,
      isConfigured: true,
      simulated: false,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId,
      total,
      subtotal,
      discount,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not initialize online checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
