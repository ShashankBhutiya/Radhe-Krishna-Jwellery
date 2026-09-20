'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/store/wishlist';
import { useAuth } from '@/store/auth';
import { ProductGrid } from '@/components/product-card';
import { Empty } from '@/components/ui';
import { GridSkeleton } from '@/components/grid-skeleton';
import type { CardProduct } from '@/lib/queries';

export function WishlistView() {
  const ids = useWishlist((s) => s.ids);
  const user = useAuth((s) => s.user);
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

  if (!user) {
    return (
      <Empty
        title="Sign in to view your wishlist"
        copy="Your saved pieces will appear here once you sign in to your account."
        action={{ href: '/login?next=/wishlist&reason=wishlist', label: 'Sign in / Create account' }}
      />
    );
  }

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
