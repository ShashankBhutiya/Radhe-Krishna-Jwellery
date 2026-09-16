import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productImageUrl } from '@/lib/uploads';

const schema = z.object({
  name: z.string().min(2, 'Enter a product name'),
  slug: z.string().min(2, 'Enter a URL slug'),
  sku: z.string().min(2, 'Enter a SKU'),
  shortDesc: z.string().min(4, 'Add a short description'),
  description: z.string().min(10, 'Add a full description'),
  price: z.number().int().min(0),
  mrp: z.number().int().min(0),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1, 'Pick a category'),
  material: z.string().min(1),
  color: z.string().min(1),
  occasion: z.string().min(1),
  weightGrams: z.number().int().min(1),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isBestseller: z.boolean(),
  isActive: z.boolean(),
  images: z.array(productImageUrl),
});

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;

  const clash = await prisma.product.findFirst({
    where: { OR: [{ slug: d.slug }, { sku: d.sku }] },
    select: { slug: true, sku: true },
  });
  if (clash) {
    return NextResponse.json(
      { error: clash.slug === d.slug ? 'That URL slug is already in use.' : 'That SKU is already in use.' },
      { status: 409 },
    );
  }

  const { images, ...rest } = d;
  const product = await prisma.product.create({
    data: {
      ...rest,
      mrp: d.mrp || d.price,
      images: { create: images.map((url, i) => ({ url, alt: d.name, sortOrder: i })) },
    },
  });

  revalidatePath('/shop');
  revalidatePath('/admin/products');
  return NextResponse.json({ ok: true, id: product.id });
}
