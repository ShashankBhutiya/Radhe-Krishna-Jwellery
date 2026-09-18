import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let products: Array<{ slug: string; createdAt: Date }> = [];
  let categories: Array<{ slug: string }> = [];
  let posts: Array<{ slug: string; publishedAt: Date }> = [];

  try {
    [products, categories, posts] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.post.findMany({ select: { slug: true, publishedAt: true }, orderBy: { publishedAt: 'desc' } }),
    ]);
  } catch (err) {
    console.warn('Sitemap dynamic database query deferred:', err instanceof Error ? err.message : err);
  }

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/lookbook`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${SITE_URL}/policies/shipping`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${SITE_URL}/policies/returns`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${SITE_URL}/policies/cancellation`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${SITE_URL}/policies/privacy`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${SITE_URL}/policies/terms`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 },
    ...categories.map((category) => ({
      url: `${SITE_URL}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/lookbook/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
