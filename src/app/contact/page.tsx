import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { SITE, addressLine, absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Contact Us — Jewellery in Indore',
  description:
    'Get in touch with Radhe Krishna Collection in Indore for order tracking, bridal consultations, custom pieces, and bulk wedding orders. Quick WhatsApp and phone support.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact Us | ${SITE.brandName} — Indore`,
    description:
      'Questions about an order, custom bridal suite or bulk wedding gifts. Dispatched and crafted from Indore, India.',
    url: '/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: `Contact Us | ${SITE.brandName} — Indore`,
    description:
      'Reach out for customer care, wedding orders and workshop enquiries in Indore.',
  },
};

export default function ContactPage() {
  const details = [
    { icon: MapPin, label: 'Workshop & store', value: addressLine() || `${SITE.address.city}, ${SITE.address.state}` },
    { icon: Phone, label: 'Phone', value: SITE.phone, href: SITE.phoneHref },
    { icon: Mail, label: 'Email', value: SITE.email, href: SITE.email ? 'mailto:' + SITE.email : '' },
    { icon: Clock, label: 'Hours', value: SITE.hours },
  ].filter((d) => d.value);

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `${SITE.name} Customer Support & Workshop`,
    url: absoluteUrl('/contact'),
    mainEntity: { '@id': `${SITE.url}/#organization` },
  };

  return (
    <>
      <JsonLd data={contactSchema} />
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">We are listening</span>
          <h1 className="display-lg mt-4">Contact Radhe Krishna in Indore</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
            Order questions, bulk enquiries for weddings and return gifts, or a custom commission. We reply within
            one working day.
          </p>
        </div>
      </header>

      <div className="container-lux grid gap-14 py-14 lg:grid-cols-[1fr_380px] lg:gap-20 lg:py-20">
        <ContactForm />

        <aside>
          <div className="card-surface p-7">
            <h2 className="font-display text-2xl font-light">Reach us directly</h2>

            <dl className="mt-6 space-y-6">
              {details.map((d) => (
                <div key={d.label} className="flex gap-4">
                  <d.icon size={17} strokeWidth={1.4} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="label-muted">{d.label}</dt>
                    <dd className="mt-1 text-[14px] leading-relaxed text-ink">
                      {d.href ? (
                        <a href={d.href} className="hover:text-gold-deep">{d.value}</a>
                      ) : (
                        d.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <a
              href={'https://wa.me/' + SITE.whatsapp}
              target="_blank"
              rel="noreferrer noopener"
              className="btn mt-8 w-full bg-[#1f8f4e] py-4 text-white hover:bg-[#177a41]"
            >
              <MessageCircle size={14} strokeWidth={1.8} />
              Chat on WhatsApp
            </a>
          </div>

          <div className="card-surface mt-6 p-7">
            <h2 className="font-display text-2xl font-light">Jewellery in Nayta Mundla, Indore</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
              Find us at {addressLine()}. Call or WhatsApp before travelling for help with availability and directions.
              Browse our necklaces, earrings and bridal jewellery online, with delivery across India.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-gold-deep underline underline-offset-4"
            >
              Find this address on Google Maps
            </a>
            <Link href="/shop" className="btn-outline mt-5 w-full">Browse jewellery</Link>
          </div>

          <div className="card-surface mt-6 p-7">
            <h2 className="font-display text-2xl font-light">Bulk & wedding orders</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
              Ordering 20 pieces or more for return gifts or a trousseau? We offer tiered pricing, matched finishes
              across the batch, and gift packaging at cost. Mention the quantity and date in your message and we will
              send a quote the same day.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
