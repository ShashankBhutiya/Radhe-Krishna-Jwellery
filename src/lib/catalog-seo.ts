import type { Metadata } from 'next';
import { SITE } from './site';

export type CatalogParams = Record<string, string | string[] | undefined>;

export function catalogPage(value: CatalogParams['page']): number {
  const page = typeof value === 'string' ? Number(value) : 1;
  return Number.isSafeInteger(page) && page > 0 && page <= 100000 ? page : 1;
}

/** Keep discovery pages indexable; search/filter combinations are not landing pages. */
export function catalogMetadata(path: string, title: string, description: string, params: CatalogParams, image = '/opengraph-image'): Metadata {
  const page = catalogPage(params.page);
  const filtered = ['q', 'material', 'occasion', 'colour', 'band', 'stock'].some((key) => {
    const value = params[key];
    return Array.isArray(value) ? value.some(Boolean) : Boolean(value);
  });
  const sorted = typeof params.sort === 'string' && params.sort !== 'featured';
  const canonical = `${path}${page > 1 ? `?page=${page}` : ''}`;
  const pageTitle = `${title}${page > 1 ? ` — Page ${page}` : ''}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    robots: { index: !filtered && !sorted, follow: true },
    openGraph: { title: `${pageTitle} | ${SITE.brandName}`, description, url: canonical, type: 'website', siteName: SITE.brandName, locale: 'en_IN', images: [{ url: image, alt: title }] },
    twitter: { card: 'summary_large_image', title: pageTitle, description, images: [image] },
  };
}
