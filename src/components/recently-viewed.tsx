'use client';

import { useEffect, useState } from 'react';
import { useRecent } from '@/store/ui';
import { ProductRail } from '@/components/product-card';
import { SectionHeading } from '@/components/ui';
import type { CardProduct } from '@/lib/queries';

/**
 * Reads the locally stored ids and rehydrates them from the API, so the rail
 * always shows live prices and stock rather than a stale local snapshot.
 */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecent((s) => s.ids);
  const [products, setProducts] = useState<CardProduct[]>([]);

  useEffect(() => {
    const wanted = ids.filter((id) => id !== excludeId).slice(0, 4);
    if (!wanted.length) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/products/by-ids?ids=${wanted.join(',')}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProducts(d.products ?? []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [ids, excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="container-lux py-20 lg:py-24">
      <SectionHeading eyebrow="Pick up where you left off" title="Recently viewed" align="left" />
      <ProductRail products={products} />
    </section>
  );
}
