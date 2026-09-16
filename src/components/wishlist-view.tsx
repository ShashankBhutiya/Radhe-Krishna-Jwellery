'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/store/wishlist';
import { ProductGrid } from '@/components/product-card';
import { Empty } from '@/components/ui';
import { GridSkeleton } from '@/components/grid-skeleton';
import type { CardProduct } from '@/lib/queries';

export function WishlistView() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<CardProduct[] | null>(null);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    fetch('/api/products/by-ids?ids=' + ids.join(','))
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  if (products === null) return <GridSkeleton count={4} />;

  if (products.length === 0) {
    return (
      <Empty
        title="Nothing saved yet"
        copy="Tap the heart on any piece to keep it here while you decide."
        action={{ href: '/shop', label: 'Browse the collection' }}
      />
    );
  }

  return <ProductGrid products={products} />;
}
