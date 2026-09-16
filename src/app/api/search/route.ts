import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { shortDesc: { contains: q, mode: 'insensitive' } },
        { material: { contains: q, mode: 'insensitive' } },
        { occasion: { contains: q, mode: 'insensitive' } },
        { category: { is: { name: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    take: 6,
    orderBy: [{ isBestseller: 'desc' }, { isFeatured: 'desc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      category: { select: { name: true } },
      images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  });

  return NextResponse.json({
    hits: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      price: r.price,
      image: r.images[0]?.url ?? null,
      category: r.category.name,
    })),
  });
}
