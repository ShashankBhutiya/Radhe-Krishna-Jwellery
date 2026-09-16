import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({ email: z.string().email('Enter a valid email address') });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ ok: true, message: 'You are already on the list.' });

  await prisma.newsletterSubscriber.create({ data: { email } });
  return NextResponse.json({ ok: true, message: 'Welcome. Use code WELCOME10 for 10% off.' });
}
