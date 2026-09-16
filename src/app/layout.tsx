import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CartDrawer } from '@/components/cart-drawer';
import { SearchOverlay } from '@/components/search-overlay';
import { Toaster, WishlistSync } from '@/components/toaster';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { getCategories } from '@/lib/queries';
import { getSession } from '@/lib/auth';
import { SITE } from '@/lib/site';

const display = Cormorant_Garamond({
  subsets: ['devanagari'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://radhekrishnajewellery.in'),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'imitation jewellery',
    'artificial jewellery online',
    'kundan jewellery',
    'oxidised silver jewellery',
    'bridal jewellery set',
    'jhumka earrings',
    'temple jewellery',
  ],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: 'website',
    locale: 'en_IN',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF8F3',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, session] = await Promise.all([getCategories(), getSession()]);

  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    image: c.image,
  }));

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>

        <SiteHeader categories={navCategories} user={session ? { name: session.name } : null} />

        <main id="main" className="min-h-[60vh]">
          {children}
        </main>

        <SiteFooter categories={navCategories} />

        <CartDrawer />
        <SearchOverlay />
        <Toaster />
        <WishlistSync signedIn={!!session} />
        <WhatsAppButton />
      </body>
    </html>
  );
}
