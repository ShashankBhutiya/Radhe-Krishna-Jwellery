import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().min(3, 'Add a subject'),
  message: z.string().min(10, 'Tell us a little more'),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;
  await prisma.contactMessage.create({
    data: { name: d.name, email: d.email, phone: d.phone || null, subject: d.subject, message: d.message },
  });

  return NextResponse.json({ ok: true, message: 'Thank you. We reply within one working day.' });
}
