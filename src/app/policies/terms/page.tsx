import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE.brandName}`,
  description: `Terms and conditions of sale, warranty guidelines, and order policies for ${SITE.name}.`,
  alternates: { canonical: '/policies/terms' },
};

const SECTIONS: [string, string][] = [
  ['About these terms', 'By placing an order on this site you agree to the terms below. They sit alongside our shipping, returns and privacy policies, which form part of the same agreement.'],
  ['Product description', 'Everything sold here is imitation jewellery, also called artificial or fashion jewellery. Pieces are made from a brass base with gold-tone or silver-tone plating and simulated stones. No item contains precious metal or precious gemstones, and no item is sold as such.'],
  ['Pricing and availability', 'All prices are in Indian rupees and include applicable taxes. We may change prices at any time, but never after an order has been confirmed. If an item sells out between your order and dispatch we contact you and refund that line in full.'],
  ['Colour and finish', 'Product photography is shot under neutral light without colour grading, but screens vary. Minor variation in tone between the photograph and the piece is normal and is not itself grounds for a warranty claim, though it is covered by the standard 7-day return.'],
  ['Handmade variation', 'Pieces are finished by hand, so small differences in stone placement and polish between two units of the same design are expected and are part of how the work is made.'],
  ['Limitation of liability', 'Our liability for any order is limited to the amount you paid for it. We are not liable for indirect losses, including missed occasions caused by courier delays outside our control.'],
  ['Governing law', 'These terms are governed by the laws of India, and any dispute falls under the jurisdiction of the courts of Indore, Madhya Pradesh.'],
];

export default function PolicyPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">The agreement</span>
          <h1 className="display-lg mt-4">Terms of service</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mt-5 text-[12.5px] text-ink-3">Last updated 2 September 2026</p>
        </div>
      </header>

      <div className="container-lux py-14 lg:py-20">
        <div className="mx-auto max-w-[68ch]">
          {SECTIONS.map(([heading, body], i) => (
            <section key={heading} className={i > 0 ? 'mt-10' : ''}>
              <h2 className="font-display text-[26px] font-light leading-snug">{heading}</h2>
              <p className="mt-3 text-[15.5px] leading-[1.85] text-ink-2 text-pretty">{body}</p>
            </section>
          ))}

          <div className="mt-14 border-t border-line pt-8">
            <p className="text-[14px] leading-relaxed text-ink-2">
              Questions about this policy? Call{' '}
              <a href={SITE.phoneHref} className="text-gold-deep underline underline-offset-4">{SITE.phone}</a>
              {SITE.email ? (
                <>
                  {' '}or email{' '}
                  <a href={'mailto:' + SITE.email} className="text-gold-deep underline underline-offset-4">{SITE.email}</a>
                </>
              ) : null}.
            </p>
            <Link href="/contact" className="btn-outline mt-6">Contact us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
