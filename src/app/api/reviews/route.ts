import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const schema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3, 'Give your review a short title'),
  body: z.string().min(10, 'Tell us a little more (at least 10 characters)'),
  authorName: z.string().min(2, 'Please enter your name').optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { productId, rating, title, body, authorName } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const name = session?.name ?? authorName;
  if (!name) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 });

  await prisma.review.create({
    data: { productId, userId: session?.id ?? null, authorName: name, rating, title, body },
  });

  revalidatePath('/product/' + product.slug);
  return NextResponse.json({ ok: true });
}
