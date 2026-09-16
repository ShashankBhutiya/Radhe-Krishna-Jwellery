'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { inr, cn } from '@/lib/utils';
import { useUI } from '@/store/ui';
import { Spinner } from '@/components/ui';

type P = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  isActive: boolean;
  category: string;
  image: string | null;
};

export function AdminProductRow({ product }: { product: P }) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    await fetch('/api/admin/products/' + product.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    toast(product.isActive ? 'Product hidden from the store' : 'Product is live');
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm('Delete "' + product.name + '"? This cannot be undone.')) return;
    setBusy(true);
    const res = await fetch('/api/admin/products/' + product.id, { method: 'DELETE' });
    if (res.ok) toast('Product deleted');
    else toast('Could not delete that product', 'error');
    setBusy(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-5 py-3">
        <Link href={'/admin/products/' + product.id} className="group flex items-center gap-3">
          <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-canvas-2">
            {product.image ? <Image src={product.image} alt="" fill sizes="44px" className="object-cover" /> : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[16px] group-hover:text-gold-deep lg:max-w-[220px]">
              {product.name}
            </span>
            <span className="block text-[11px] text-ink-3">{product.sku}</span>
          </span>
        </Link>
      </td>
      <td data-label="Category" className="px-3 py-3 text-[13px] text-ink-2">{product.category}</td>
      <td data-label="Price" className="px-3 py-3">
        <span>
          <span className="block text-[13.5px]">{inr(product.price)}</span>
          {product.mrp > product.price ? (
            <span className="block text-[11px] text-ink-3 line-through">{inr(product.mrp)}</span>
          ) : null}
        </span>
      </td>
      <td data-label="Stock" className="px-3 py-3">
        <span
          className={cn(
            'text-[13px]',
            product.stock === 0 ? 'text-wine' : product.stock <= 5 ? 'text-gold-deep' : 'text-ink-2',
          )}
        >
          {product.stock === 0 ? 'Sold out' : product.stock}
        </span>
      </td>
      <td data-label="Status" className="px-3 py-3">
        <span
          className={cn(
            'inline-flex border px-2 py-0.5 text-[9.5px] uppercase tracking-label',
            product.isActive ? 'border-forest/30 bg-forest/8 text-forest' : 'border-line bg-canvas-2 text-ink-3',
          )}
        >
          {product.isActive ? 'Live' : 'Hidden'}
        </span>
      </td>
      <td data-label="Actions" className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          {busy ? (
            <Spinner className="text-ink-3" />
          ) : (
            <>
              <button
                type="button"
                onClick={toggleActive}
                aria-label={product.isActive ? 'Hide product' : 'Publish product'}
                className="grid h-8 w-8 place-items-center text-ink-3 hover:text-gold-deep"
              >
                {product.isActive ? <Eye size={14} strokeWidth={1.6} /> : <EyeOff size={14} strokeWidth={1.6} />}
              </button>
              <Link
                href={'/admin/products/' + product.id}
                aria-label="Edit product"
                className="grid h-8 w-8 place-items-center text-ink-3 hover:text-gold-deep"
              >
                <Pencil size={14} strokeWidth={1.6} />
              </Link>
              <button
                type="button"
                onClick={remove}
                aria-label="Delete product"
                className="grid h-8 w-8 place-items-center text-ink-3 hover:text-wine"
              >
                <Trash2 size={14} strokeWidth={1.6} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
