import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-label text-ink-2 hover:text-gold-deep">
        <ArrowLeft size={13} strokeWidth={1.8} /> All products
      </Link>

      <h1 className="display-md">{product.name}</h1>
      <p className="mt-2 text-[14px] text-ink-2">
        {product.sku} ·{' '}
        <Link href={'/product/' + product.slug} className="text-gold-deep underline underline-offset-4">
          View on storefront
        </Link>
      </p>

      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDesc: product.shortDesc,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          categoryId: product.categoryId,
          material: product.material,
          color: product.color,
          occasion: product.occasion,
          weightGrams: product.weightGrams,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isBestseller: product.isBestseller,
          isActive: product.isActive,
          images: product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
