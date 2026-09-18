import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts } from '@/lib/queries';
import { ProductGrid } from '@/components/product-card';
import { FilterPanel, SortBar, ActiveChips, Pagination } from '@/components/shop-filters';
import { Empty } from '@/components/ui';
import { GridSkeleton } from '@/components/grid-skeleton';
import { PRICE_BANDS, SITE, absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/json-ld';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Shop All Imitation & Bridal Jewellery Online | ${SITE.brandName}`,
  description:
    'Browse hand-finished imitation jewellery: bridal sets, kundan necklaces, polki chokers, temple jewellery, and oxidised silver. Dispatched nationwide with 6-month warranty.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: `Shop All Imitation & Bridal Jewellery Online | ${SITE.brandName}`,
    description:
      'Browse hand-finished imitation jewellery: bridal sets, kundan necklaces, polki chokers, temple jewellery, and oxidised silver.',
    url: '/shop',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Shop Imitation Jewellery — Radhe Krishna Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Shop All Imitation & Bridal Jewellery Online | ${SITE.brandName}`,
    description:
      'Browse hand-finished imitation jewellery: bridal sets, kundan necklaces, polki chokers, temple jewellery, and oxidised silver.',
    images: ['/opengraph-image'],
  },
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
  const shopUrl = absoluteUrl('/shop');

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: shopUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'All Jewellery Collections',
            description:
              'Browse the full catalogue of hand-finished imitation jewellery on solid brass: bridal, kundan, polki, temple, and oxidised silver.',
            url: shopUrl,
            isPartOf: {
              '@type': 'WebSite',
              name: SITE.brandName,
              url: SITE.url,
            },
          },
        ]}
      />
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
