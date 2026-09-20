import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = [
    '/admin/',
    '/account/',
    '/api/',
    '/order/',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/uploads/'],
        disallow: privateRoutes,
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'Applebot'],
        allow: ['/', '/api/uploads/'],
        disallow: privateRoutes,
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
        allow: ['/', '/api/uploads/'],
        disallow: privateRoutes,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
