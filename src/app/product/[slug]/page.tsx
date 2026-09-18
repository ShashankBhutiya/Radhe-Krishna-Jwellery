import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { ProductRail } from '@/components/product-card';
import { RecentlyViewed } from '@/components/recently-viewed';
import { SectionHeading, Price, Stars, Badge } from '@/components/ui';
import {
  ProductGallery,
  AddToCartPanel,
  Accordion,
  ReviewsSection,
  TrackRecentView,
} from '@/components/product-detail';
import { SITE } from '@/lib/site';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/json-ld';
import { inr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Piece not found' };

  const title = `${product.name} — ${product.category.name}`;
  const description = `${product.shortDesc} Hand-finished imitation jewellery on solid brass with 6-month warranty and 7-day easy returns. Pan-India shipping from Indore.`;
  const primaryImage = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      type: 'website',
      images: primaryImage ? [{ url: primaryImage, alt: product.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, session] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getSession(),
  ]);

  const specs: [string, string][] = [
    ['Material', product.material],
    ['Colour', product.color],
    ['Best for', product.occasion],
    ['Weight', `${product.weightGrams} g approx.`],
    ['SKU', product.sku],
    ['Collection', product.category.name],
  ];
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: productUrl,
    sku: product.sku,
    image: product.images.map((image) => absoluteUrl(image.url)),
    brand: {
      '@type': 'Brand',
      name: SITE.name,
      alternateName: SITE.brandName,
    },
    category: product.category.name,
    material: product.material,
    color: product.color,
    weight: { '@type': 'QuantitativeValue', value: product.weightGrams, unitCode: 'GRM' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: SITE.currency,
      price: product.price,
      priceValidUntil,
      availability: `https://schema.org/${product.stock > 0 ? 'InStock' : 'OutOfStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE.name },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: SITE.currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
  };
  if (product.reviewCount > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
    productSchema.review = product.reviews.slice(0, 10).map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.authorName },
      datePublished: review.createdAt.toISOString(),
      name: review.title,
      reviewBody: review.body,
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    }));
  }

  return (
    <>
      <JsonLd
        data={[
          productSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
              { '@type': 'ListItem', position: 2, name: product.category.name, item: absoluteUrl(`/category/${product.category.slug}`) },
              { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
            ],
          },
        ]}
      />
      <TrackRecentView productId={product.id} />

      <nav aria-label="Breadcrumb" className="container-lux flex items-center gap-2 py-5 text-[11.5px] text-ink-3">
        <Link href="/" className="hover:text-gold-deep">Home</Link>
        <ChevronRight size={12} strokeWidth={1.6} />
        <Link href={`/category/${product.category.slug}`} className="hover:text-gold-deep">
          {product.category.name}
        </Link>
        <ChevronRight size={12} strokeWidth={1.6} />
        <span className="truncate text-ink">{product.name}</span>
      </nav>

      <div className="container-lux grid gap-12 pb-16 lg:grid-cols-2 lg:gap-16 xl:gap-24">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label">{product.category.name}</span>
            {product.isNew ? <Badge tone="gold">New</Badge> : null}
            {product.isBestseller ? <Badge tone="wine">Bestseller</Badge> : null}
          </div>

          <h1 className="display-lg mt-3 text-balance">{product.name}</h1>

          {product.reviewCount > 0 ? (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 hover:opacity-80">
              <Stars rating={product.rating} size={14} />
              <span className="text-[12.5px] text-ink-2 underline underline-offset-4">
                {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </a>
          ) : null}

          <div className="mt-6">
            <Price price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1.5 text-[11.5px] text-ink-3">Inclusive of all taxes</p>
          </div>

          <p className="mt-7 max-w-lg text-[15px] leading-[1.8] text-ink-2 text-pretty">{product.description}</p>

          <div className="mt-8">
            <AddToCartPanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                mrp: product.mrp,
                stock: product.stock,
                image: product.images[0]?.url ?? '',
              }}
            />
          </div>

          <Accordion
            items={[
              {
                title: 'Details & specification',
                content: (
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {specs.map(([k, v]) => (
                      <div key={k} className="flex flex-col border-b border-line/60 pb-2">
                        <dt className="text-[10.5px] uppercase tracking-label text-ink-3">{k}</dt>
                        <dd className="mt-1 text-[14px] text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ),
              },
              {
                title: 'Shipping & delivery',
                content: (
                  <div className="space-y-2">
                    <p>
                      Dispatched within 24 working hours from Indore. Metro cities receive orders in 2–4 days, the
                      rest of India in 4–7 days.
                    </p>
                    <p>
                      Shipping is 100% complimentary on every single order across India with no minimum spend. Cash
                      on delivery is available nationwide at no extra charge.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Care instructions',
                content: (
                  <ul className="space-y-2">
                    <li>Wear jewellery last, after perfume, hairspray and lotion have fully dried.</li>
                    <li>Wipe with the dry flannel cloth provided after each wear — never use water or polish.</li>
                    <li>Store in the anti-tarnish pouch, one piece per pouch, away from humidity.</li>
                    <li>Remove before bathing, swimming or sleeping to protect the plating.</li>
                  </ul>
                ),
              },
              {
                title: 'Returns & warranty',
                content: (
                  <div className="space-y-2">
                    <p>
                      Return any unworn piece within 7 days of delivery for a full refund — no restocking fee, no
                      questions asked. Keep the original packaging and tags.
                    </p>
                    <p>
                      Every piece carries a 6-month warranty against plating loss under normal wear. Call{' '}
                      <a href={SITE.phoneHref} className="text-gold-deep underline underline-offset-2">
                        {SITE.phone}
                      </a>{' '}
                      with your order number and we will replace it.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="container-lux pb-20">
        <ReviewsSection
          productId={product.id}
          reviews={product.reviews}
          rating={product.rating}
          signedInName={session?.name ?? null}
        />
      </div>

      {related.length > 0 ? (
        <section className="container-lux pb-20">
          <SectionHeading
            eyebrow="Completes the look"
            title="You may also like"
            align="left"
            href={`/category/${product.category.slug}`}
            linkLabel={`All ${product.category.name}`}
          />
          <ProductRail products={related} />
        </section>
      ) : null}

      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
