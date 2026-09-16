import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productImageUrl, pruneOrphanUploads } from '@/lib/uploads';

const schema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  shortDesc: z.string().min(4).optional(),
  description: z.string().min(10).optional(),
  price: z.number().int().min(0).optional(),
  mrp: z.number().int().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  material: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  occasion: z.string().min(1).optional(),
  weightGrams: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(productImageUrl).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const { images, ...rest } = parsed.data;

  if (rest.slug || rest.sku) {
    const clash = await prisma.product.findFirst({
      where: {
        id: { not: id },
        OR: [...(rest.slug ? [{ slug: rest.slug }] : []), ...(rest.sku ? [{ sku: rest.sku }] : [])],
      },
      select: { id: true },
    });
    if (clash) return NextResponse.json({ error: 'That slug or SKU is already in use.' }, { status: 409 });
  }

  await prisma.product.update({ where: { id }, data: rest });

  // Images are replaced wholesale so ordering always matches the form.
  if (images) {
    const previous = await prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });

    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((url, i) => ({ productId: id, url, alt: rest.name ?? '', sortOrder: i })),
      });
    }

    await pruneOrphanUploads(previous.map((i) => i.url));
  }

  revalidatePath('/shop');
  revalidatePath('/admin/products');
  revalidatePath('/product/' + existing.slug);
  if (rest.slug) revalidatePath('/product/' + rest.slug);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Not authorised' }, { status: 403 });

  const { id } = await params;

  // Orders reference products by id, so hide rather than destroy sold pieces.
  const sold = await prisma.orderItem.count({ where: { productId: id } });
  if (sold > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/admin/products');
    return NextResponse.json({ ok: true, archived: true });
  }

  const images = await prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });
  await prisma.product.delete({ where: { id } });
  await pruneOrphanUploads(images.map((i) => i.url));

  revalidatePath('/shop');
  revalidatePath('/admin/products');
  return NextResponse.json({ ok: true });
}
