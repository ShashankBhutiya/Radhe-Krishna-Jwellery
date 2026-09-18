import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = [
    '/admin/',
    '/account/',
    '/api/',
    '/cart',
    '/checkout',
    '/wishlist',
    '/login',
    '/register',
    '/order/',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'Applebot'],
        allow: '/',
        disallow: privateRoutes,
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
        allow: '/',
        disallow: privateRoutes,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
