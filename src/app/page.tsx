import { prisma } from '@/lib/prisma';
import { getCategories, getHomeSections } from '@/lib/queries';
import { ProductRail } from '@/components/product-card';
import { SectionHeading } from '@/components/ui';
import { TrustBar } from '@/components/site-footer';
import { RecentlyViewed } from '@/components/recently-viewed';
import {
  Hero,
  CategoryStrip,
  EditorialSplit,
  OccasionTiles,
  Testimonials,
  LookbookTeaser,
  NewsletterBand,
} from '@/components/home';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, sections, posts, heroImages] = await Promise.all([
    getCategories(),
    getHomeSections(),
    prisma.post.findMany({ orderBy: { publishedAt: 'desc' }, take: 3 }),
    prisma.productImage.findMany({ take: 12, orderBy: { id: 'asc' }, select: { url: true } }),
  ]);

  const pool = heroImages.map((i) => i.url);
  const fallback = categories[0]?.image ?? pool[0] ?? '';

  return (
    <>
      <Hero image={categories[6]?.image ?? fallback} secondary={categories[1]?.image ?? fallback} />

      <TrustBar />

      <CategoryStrip categories={categories} />

      {sections.featured.length > 0 ? (
        <section className="container-lux pb-20 lg:pb-28">
          <SectionHeading
            eyebrow="Hand-picked"
            title="The atelier selection"
            copy="The pieces our karigars are proudest of this season."
            align="left"
            href="/shop?sort=featured"
          />
          <ProductRail products={sections.featured.slice(0, 4)} />
        </section>
      ) : null}

      <EditorialSplit image={categories[8]?.image ?? fallback} />

      {sections.bestsellers.length > 0 ? (
        <section className="container-lux py-20 lg:py-28">
          <SectionHeading
            eyebrow="Most loved"
            title="Bestsellers"
            copy="Reordered, gifted and worn again — the pieces that keep leaving the shelf."
            align="left"
            href="/shop?sort=rating"
          />
          <ProductRail products={sections.bestsellers.slice(0, 4)} />
        </section>
      ) : null}

      <OccasionTiles images={categories.slice(0, 6).map((c) => c.image ?? fallback)} />

      {sections.newest.length > 0 ? (
        <section className="container-lux pb-20 lg:pb-28">
          <SectionHeading
            eyebrow="Just arrived"
            title="New this season"
            align="left"
            href="/shop?sort=new"
          />
          <ProductRail products={sections.newest.slice(0, 4)} />
        </section>
      ) : null}

      <Testimonials />

      <LookbookTeaser posts={posts} />

      <RecentlyViewed />

      <NewsletterBand />
    </>
  );
}
