import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ ids: [] }, { status: 401 });

  const rows = await prisma.wishlistItem.findMany({
    where: { userId: session.id },
    select: { productId: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ ids: rows.map((r) => r.productId) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { productId } = await req.json().catch(() => ({ productId: null }));
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  const exists = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: session.id, productId } },
    create: { userId: session.id, productId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { productId } = await req.json().catch(() => ({ productId: null }));
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  await prisma.wishlistItem.deleteMany({ where: { userId: session.id, productId } });
  return NextResponse.json({ ok: true });
}
