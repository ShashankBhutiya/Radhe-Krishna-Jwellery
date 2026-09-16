import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/utils';

export async function POST(req: Request) {
  const { code, subtotal } = await req.json().catch(() => ({ code: '', subtotal: 0 }));
  const normalised = String(code || '').toUpperCase().trim();
  if (!normalised) return NextResponse.json({ error: 'Enter a coupon code' }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: normalised } });
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'That code is not valid.' }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: 'That code has expired.' }, { status: 410 });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'That code has been fully redeemed.' }, { status: 410 });
  }
  if (subtotal < coupon.minOrder) {
    return NextResponse.json(
      { error: 'Add ' + inr(coupon.minOrder - subtotal) + ' more to use this code.' },
      { status: 400 },
    );
  }

  let discount = coupon.type === 'PERCENT' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, subtotal);

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount,
    description: coupon.description,
    freeShipping: coupon.code === 'FREESHIP',
  });
}
