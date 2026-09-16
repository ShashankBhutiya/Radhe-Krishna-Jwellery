/**
 * Single source of truth for business details.
 * Empty strings are unconfirmed details — fill them in and they appear across the site.
 */
export const SITE = {
  name: 'Radhe Krishna Jewellery',
  shortName: 'Radhe Krishna',
  tagline: 'Heirloom-grade imitation jewellery, made for every celebration.',
  description:
    'Hand-finished imitation jewellery — kundan, polki, temple, oxidised silver and pearl — crafted with the weight and lustre of fine jewellery, at a fraction of the price.',
  phone: '+91 99935 61194',
  phoneHref: 'tel:+919993561194',
  whatsapp: '919993561194',
  // Fill these in once confirmed — the UI hides each field while it is empty.
  email: '',
  address: {
    line1: '',
    line2: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
  },
  hours: 'Mon – Sat, 10:00 AM – 8:00 PM IST',
  // Add the real profile URLs here — empty entries are not rendered.
  social: {
    instagram: '',
    facebook: '',
    youtube: '',
    pinterest: '',
  },
  freeShippingAbove: 999,
  shippingFlat: 79,
  codFee: 0,
  currency: 'INR',
} as const;

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
