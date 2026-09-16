import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderNumber } from '@/lib/utils';
import { SITE } from '@/lib/site';

const schema = z.object({
  customerName: z.string().min(2, 'Enter the full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  addressLine1: z.string().min(4, 'Enter the address'),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'Enter the city'),
  state: z.string().min(2, 'Enter the state'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  paymentMethod: z.enum(['COD', 'ONLINE']),
  couponCode: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  items: z
    .array(z.object({ id: z.string(), qty: z.number().int().min(1) }))
    .min(1, 'Your bag is empty'),
});

export async function POST(req: Request) {
  const session = await getSession();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;

  // Re-read prices from the database; never trust client-side totals.
  const products = await prisma.product.findMany({
    where: { id: { in: d.items.map((i) => i.id) }, isActive: true },
    include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
  });

  if (products.length !== d.items.length) {
    return NextResponse.json({ error: 'One or more items are no longer available.' }, { status: 409 });
  }

  const lines = d.items.map((i) => {
    const p = products.find((x) => x.id === i.id)!;
    return { product: p, qty: Math.min(i.qty, Math.max(p.stock, 0)) };
  });

  const outOfStock = lines.filter((l) => l.qty === 0);
  if (outOfStock.length) {
    return NextResponse.json(
      { error: outOfStock[0].product.name + ' just sold out. Please remove it and try again.' },
      { status: 409 },
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  let discount = 0;
  let freeShipping = false;
  let appliedCode: string | null = null;

  if (d.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: d.couponCode.toUpperCase().trim() } });
    const usable =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minOrder;

    if (usable && coupon) {
      appliedCode = coupon.code;
      if (coupon.code === 'FREESHIP') {
        freeShipping = true;
      } else {
        discount = coupon.type === 'PERCENT' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
        if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
        discount = Math.min(discount, subtotal);
      }
      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
  }

  const shipping = freeShipping || subtotal - discount >= SITE.freeShippingAbove ? 0 : SITE.shippingFlat;
  const total = subtotal - discount + shipping;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        userId: session?.id ?? null,
        customerName: d.customerName,
        email: d.email.toLowerCase().trim(),
        phone: d.phone,
        addressLine1: d.addressLine1,
        addressLine2: d.addressLine2 || null,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        subtotal,
        discount,
        shipping,
        total,
        couponCode: appliedCode,
        paymentMethod: d.paymentMethod,
        paymentStatus: d.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        status: 'PLACED',
        notes: d.notes || null,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            name: l.product.name,
            slug: l.product.slug,
            image: l.product.images[0]?.url ?? '',
            price: l.product.price,
            qty: l.qty,
          })),
        },
      },
    });

    for (const l of lines) {
      await tx.product.update({ where: { id: l.product.id }, data: { stock: { decrement: l.qty } } });
    }

    return created;
  });

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
