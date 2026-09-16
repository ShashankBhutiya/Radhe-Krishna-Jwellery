import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { inr } from '@/lib/utils';
import { AdminProductRow } from '@/components/admin/product-row';

export const dynamic = 'force-dynamic';

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            { material: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md">Products</h1>
          <p className="mt-2 text-[14px] text-ink-2">{products.length} pieces in the catalogue.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary btn-sm">
          <Plus size={13} strokeWidth={2} /> New product
        </Link>
      </div>

      <form className="mt-6 flex max-w-sm items-center gap-2" action="/admin/products">
        <div className="relative flex-1">
          <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input name="q" defaultValue={q ?? ''} placeholder="Search name or SKU" className="field pl-10" />
        </div>
        <button type="submit" className="btn-outline px-5 py-3">Search</button>
      </form>

      <div className="card-surface mt-6 lg:overflow-x-auto">
        <table className="table-stack lg:min-w-[720px]">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Piece</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Category</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Price</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Stock</th>
              <th className="px-3 py-3.5 text-[10.5px] uppercase tracking-label text-ink-3">Status</th>
              <th className="px-5 py-3.5 text-right text-[10.5px] uppercase tracking-label text-ink-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center text-sm text-ink-2">
                  No products matched. <Link href="/admin/products" className="text-gold-deep underline">Clear search</Link>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <AdminProductRow
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    sku: p.sku,
                    price: p.price,
                    mrp: p.mrp,
                    stock: p.stock,
                    isActive: p.isActive,
                    category: p.category.name,
                    image: p.images[0]?.url ?? null,
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
