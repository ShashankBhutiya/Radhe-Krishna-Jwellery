import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const schema = z.object({
  label: z.string().min(1).default('Home'),
  name: z.string().min(2, 'Enter the full name'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  line1: z.string().min(4, 'Enter the address'),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'Enter the city'),
  state: z.string().min(2, 'Enter the state'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit PIN code'),
  isDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;
  if (d.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
  }

  const count = await prisma.address.count({ where: { userId: session.id } });
  await prisma.address.create({
    data: {
      userId: session.id,
      label: d.label,
      name: d.name,
      phone: d.phone,
      line1: d.line1,
      line2: d.line2 || null,
      city: d.city,
      state: d.state,
      pincode: d.pincode,
      isDefault: d.isDefault ?? count === 0,
    },
  });

  revalidatePath('/account/addresses');
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.address.deleteMany({ where: { id, userId: session.id } });
  revalidatePath('/account/addresses');
  return NextResponse.json({ ok: true });
}
