import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.brandName} — Imitation & Bridal Jewellery`,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#211A17',
    theme_color: '#FBF8F3',
    icons: [
      {
        src: '/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    categories: ['shopping', 'lifestyle'],
    lang: 'en-IN',
  };
}
