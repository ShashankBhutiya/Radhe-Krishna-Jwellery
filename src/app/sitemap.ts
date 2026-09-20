import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

// A database outage must not publish a successful sitemap missing all products.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, posts] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true }, orderBy: { slug: 'asc' } }),
    prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      select: { slug: true },
      orderBy: { slug: 'asc' },
    }),
    prisma.post.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } }),
  ]);

  // Omit lastmod until genuine edit timestamps exist; generation and creation
  // dates are not edit dates. Only canonical URLs belong in the sitemap.
  const paths = [
    '/', '/shop', '/lookbook', '/about', '/contact', '/faq',
    '/policies/shipping', '/policies/returns', '/policies/privacy', '/policies/terms',
    ...categories.map(({ slug }) => '/category/' + encodeURIComponent(slug)),
    ...products.map(({ slug }) => '/product/' + encodeURIComponent(slug)),
    ...posts.map(({ slug }) => '/lookbook/' + encodeURIComponent(slug)),
  ];
  return paths.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
