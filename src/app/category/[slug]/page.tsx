import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ShopResults } from '@/components/shop-results';
import { GridSkeleton } from '@/components/grid-skeleton';
import { JsonLd } from '@/components/json-ld';
import { SITE, absoluteUrl } from '@/lib/site';
import { catalogMetadata } from '@/lib/catalog-seo';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const title = `${category.name} Online`;
  const description = category.description || `Explore ${category.name.toLowerCase()} at ${SITE.brandName}. Shop imitation jewellery with delivery across India.`;
  const image = category.image;

  return catalogMetadata(`/category/${category.slug}`, title, description, await searchParams, image || undefined);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  if (!category) notFound();

  const categoryUrl = absoluteUrl(`/category/${category.slug}`);

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: absoluteUrl('/shop') },
              { '@type': 'ListItem', position: 3, name: category.name, item: categoryUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} Collection`,
            description: category.description,
            url: categoryUrl,
            isPartOf: {
              '@type': 'WebSite',
              name: SITE.brandName,
              url: SITE.url,
            },
          },
        ]}
      />
      <header className="relative border-b border-line">
        <div className="relative h-[320px] overflow-hidden lg:h-[420px]">
          {category.image ? (
            <Image src={category.image} alt={category.name} fill priority sizes="100vw" className="object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-ink/55" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-canvas">
            <span className="label text-gold-soft">{category.tagline}</span>
            <h1 className="display-lg mt-3 text-canvas">{category.name}</h1>
            <span className="mt-5 h-px w-14 bg-gold" />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-canvas/80 text-pretty">
              {category.description}
            </p>
            <span className="mt-4 text-[11px] uppercase tracking-label text-canvas/55">
              {category._count.products} pieces
            </span>
          </div>
        </div>

        <nav aria-label="Breadcrumb" className="container-lux flex items-center gap-2 py-4 text-[11.5px] text-ink-3">
          <Link href="/" className="hover:text-gold-deep">Home</Link>
          <ChevronRight size={12} strokeWidth={1.6} />
          <Link href="/shop" className="hover:text-gold-deep">Shop</Link>
          <ChevronRight size={12} strokeWidth={1.6} />
          <span className="text-ink">{category.name}</span>
        </nav>
      </header>

      <div className="container-lux py-12 lg:py-16">
        <Suspense fallback={<GridSkeleton />}>
          <ShopResults searchParams={sp} categorySlug={slug} />
        </Suspense>
      </div>
    </>
  );
}
