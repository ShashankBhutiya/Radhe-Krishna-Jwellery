import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/queries';
import { ProductGrid } from '@/components/product-card';
import { FilterPanel, SortBar, ActiveChips, Pagination } from '@/components/shop-filters';
import { Empty } from '@/components/ui';
import { GridSkeleton } from '@/components/grid-skeleton';
import { PRICE_BANDS } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop all jewellery',
  description: 'Browse every piece — kundan, polki, temple, oxidised silver and pearl, filtered by material, occasion and price.',
};

type SP = Record<string, string | string[] | undefined>;

const asArray = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

/** Shared by /shop and /category/[slug]. */
export async function ShopResults({
  searchParams,
  categorySlug,
}: {
  searchParams: SP;
  categorySlug?: string;
}) {
  const bandLabel = typeof searchParams.band === 'string' ? searchParams.band : undefined;
  const band = PRICE_BANDS.find((b) => b.label === bandLabel);

  const { items, total, page, pages } = await getProducts({
    category: categorySlug,
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    materials: asArray(searchParams.material),
    occasions: asArray(searchParams.occasion),
    colors: asArray(searchParams.colour),
    min: band?.min,
    max: band?.max,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'featured',
    page: Number(searchParams.page) || 1,
    perPage: 12,
    inStockOnly: searchParams.stock === 'in',
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[248px_1fr] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-32">
          <FilterPanel />
        </div>
      </aside>

      <div>
        <SortBar total={total} showing={items.length} />
        <ActiveChips />

        <div className="mt-10">
          {items.length === 0 ? (
            <Empty
              title="Nothing matches those filters"
              copy="Try widening the price band or clearing a material — the collection changes weekly."
              action={{ href: '/shop', label: 'View all pieces' }}
            />
          ) : (
            <ProductGrid products={items} cols={3} />
          )}
        </div>

        <Pagination page={page} pages={pages} />
      </div>
    </div>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : undefined;

  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">{q ? 'Search results' : 'The full collection'}</span>
          <h1 className="display-lg mt-4">{q ? `“${q}”` : 'Every piece we make'}</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
            {q
              ? 'Refine further with the filters, or clear the search to browse everything.'
              : 'Filter by material, occasion, colour and price to find the piece that finishes the look.'}
          </p>
        </div>
      </header>

      <div className="container-lux py-12 lg:py-16">
        <Suspense fallback={<GridSkeleton />}>
          <ShopResults searchParams={sp} />
        </Suspense>
      </div>
    </>
  );
}
