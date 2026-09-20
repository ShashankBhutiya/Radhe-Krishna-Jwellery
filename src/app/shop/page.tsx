import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShopResults } from '@/components/shop-results';
import { GridSkeleton } from '@/components/grid-skeleton';
import { SITE, absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/json-ld';
import { catalogMetadata } from '@/lib/catalog-seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  return catalogMetadata('/shop', 'Shop Imitation & Bridal Jewellery',
    'Browse necklaces, earrings, bangles and bridal jewellery. Explore kundan, polki and oxidised styles with delivery across India.', await searchParams);
}

type SP = Record<string, string | string[] | undefined>;

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
          <h1 className="display-lg mt-4">{q ? `Search results for “${q}”` : 'Shop imitation jewellery online'}</h1>
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
