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
import { JsonLd } from '@/components/json-ld';
import { AuthSync } from '@/components/auth-sync';

const display = Cormorant_Garamond({
  subsets: ['latin'],
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
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Imitation & Bridal Jewellery | Radhe Krishna Collection',
    template: `%s | Radhe Krishna Collection`,
  },
  description:
    'Shop imitation and bridal jewellery from Radhe Krishna Collection, Indore. Explore necklaces, earrings, bangles and kundan styles with delivery across India.',
  keywords: [
    'radhe krishna collection',
    'radhe krishna jewellery',
    'imitation jewellery online india',
    'artificial jewellery online',
    'bridal jewellery set',
    'kundan jewellery online',
    'polki necklace',
    'temple jewellery bridal',
    'oxidised silver jewellery',
    'jhumka earrings online',
    'indore imitation jewellery',
    'artificial jewellery shop in indore',
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'Jewelry & Fashion Accessories',
  openGraph: {
    title: 'Imitation & Bridal Jewellery | Radhe Krishna Collection',
    description:
      'Hand-finished kundan, polki, temple, oxidised silver and bridal jewellery sets. Nickel-free, skin-safe, delivered across India.',
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Radhe Krishna Collection',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Radhe Krishna Collection — Hand-finished Imitation Jewellery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Radhe Krishna Collection | Handcrafted Imitation Jewellery`,
    description:
      'Shop heirloom-grade imitation jewellery online in India. Kundan, polki, temple, and bridal sets dispatched from Indore.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'IN-MP',
    'geo.placename': `${SITE.address.city}, ${SITE.address.state}`,
    'format-detection': 'telephone=no',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.brandName,
    alternateName: Array.from(SITE.alternateNames),
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['JewelryStore', 'Store', 'LocalBusiness', 'Organization'],
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: Array.from(SITE.alternateNames),
    url: SITE.url,
    logo: `${SITE.url}/apple-touch-icon.png`,
    image: `${SITE.url}/opengraph-image`,
    description: SITE.description,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '₹₹',
    currenciesAccepted: SITE.currency,
    paymentAccepted: 'Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking',
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'AdministrativeArea', name: 'Madhya Pradesh' },
    ],
    address: {
      '@type': 'PostalAddress',
      ...(SITE.address.line1 ? { streetAddress: [SITE.address.line1, SITE.address.line2].filter(Boolean).join(', ') } : {}),
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.pincode,
      addressCountry: SITE.address.countryCode,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi'],
        areaServed: 'IN',
      },
    ],
    sameAs: Object.values(SITE.social).filter(Boolean),
  };

  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <JsonLd data={[websiteSchema, localBusinessSchema]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>

        <SiteHeader categories={navCategories} user={session ? { name: session.name } : null} />
        <AuthSync user={session ? { id: session.id, name: session.name, email: session.email, role: session.role } : null} />

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
