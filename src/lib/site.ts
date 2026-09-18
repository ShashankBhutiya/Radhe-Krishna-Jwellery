/**
 * Single source of truth for business details.
 * Empty strings are unconfirmed details — fill them in and they appear across the site.
 */
export const SITE = {
  url: 'https://radhekrishnacollection.com',
  altUrl: 'https://www.radhekrishnacollection.com',
  name: 'Radhe Krishna Jewellery',
  brandName: 'Radhe Krishna Collection',
  shortName: 'Radhe Krishna',
  alternateNames: [
    'Radhe Krishna Collection',
    'Radhe Krishna Jewellery',
    'Radhe Krishna Imitation Jewellery',
    'Radhe Krishna Jewellery Indore',
  ],
  tagline: 'Heirloom-grade imitation jewellery, made for every celebration.',
  description:
    'Hand-finished imitation jewellery — kundan, polki, temple, oxidised silver and pearl — crafted with the weight and lustre of fine jewellery, at a fraction of the price.',
  phone: '+91 99930 07021',
  phoneHref: 'tel:+919993007021',
  whatsapp: '919993007021',
  email: 'care@radhekrishnacollection.com',
  address: {
    line1: '',
    line2: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    country: 'India',
    countryCode: 'IN',
  },
  geo: {
    latitude: 22.7196,
    longitude: 75.8577,
  },
  hours: 'Mon – Sat, 10:00 AM – 8:00 PM IST',
  openingHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '10:00',
    closes: '20:00',
  },
  // Social profile URLs for Knowledge Graph and rich results
  social: {
    instagram: 'https://instagram.com/radhekrishnacollection',
    facebook: '',
    youtube: '',
    pinterest: '',
  },
  freeShippingAbove: 0,
  shippingFlat: 0,
  codFee: 0,
  currency: 'INR',
} as const;

export const SITE_URL = SITE.url;

/** Converts an internal path or stored image URL into a schema-safe absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** The address as one line, skipping any part that is not filled in yet. */
export function addressLine(): string {
  const a = SITE.address;
  return [a.line1, a.line2, [a.city, a.pincode].filter(Boolean).join(' '), a.state]
    .filter(Boolean)
    .join(', ');
}

export const MATERIALS = [
  'Kundan',
  'Polki',
  'Temple / Antique',
  'Oxidised Silver',
  'Gold Plated',
  'Rose Gold',
  'American Diamond',
  'Pearl',
  'Meenakari',
] as const;

export const COLORS = ['Gold', 'Silver', 'Rose Gold', 'Multi', 'Green', 'Red', 'White'] as const;

export const OCCASIONS = ['Bridal', 'Festive', 'Party', 'Daily Wear', 'Office', 'Gifting'] as const;

export const PRICE_BANDS = [
  { label: 'Under ₹999', min: 0, max: 999 },
  { label: '₹999 – ₹1,999', min: 999, max: 1999 },
  { label: '₹1,999 – ₹3,499', min: 1999, max: 3499 },
  { label: '₹3,499 – ₹5,999', min: 3499, max: 5999 },
  { label: '₹5,999 & above', min: 5999, max: 1000000 },
] as const;

export const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'new', label: 'New Arrivals' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'rating', label: 'Top Rated' },
] as const;

export const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
