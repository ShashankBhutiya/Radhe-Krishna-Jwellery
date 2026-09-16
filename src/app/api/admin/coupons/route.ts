import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({
  code: z.string().min(3, 'Codes need at least 3 characters'),
  type: z.enum(['PERCENT', 'FLAT']),
  value: z.number().int().min(1, 'Value must be at least 1'),
  minOrder: z.number().int().min(0),
  maxDiscount: z.number().int().min(0).nullable().optional(),
  description: z.string().default(''),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const code = parsed.data.code.toUpperCase().trim();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: 'That code already exists.' }, { status: 409 });

  await prisma.coupon.create({
    data: {
      ...parsed.data,
      code,
      maxDiscount: parsed.data.maxDiscount || null,
    },
  });

  revalidatePath('/admin/coupons');
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id, active } = await req.json().catch(() => ({ id: null, active: null }));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.coupon.update({ where: { id }, data: { active: !!active } });
  revalidatePath('/admin/coupons');
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.coupon.delete({ where: { id } });
  revalidatePath('/admin/coupons');
  return NextResponse.json({ ok: true });
}
