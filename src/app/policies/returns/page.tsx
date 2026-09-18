import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Cancellation, Returns & Refund Policy | ${SITE.brandName}`,
  description: `Easy cancellations before dispatch, 7-day hassle-free returns, 5-7 day refunds to original payment source, and 6-month plating warranty for ${SITE.name}.`,
  alternates: { canonical: '/policies/returns' },
};

const SECTIONS: [string, string][] = [
  ['Order cancellation', 'Orders can be cancelled free of charge at any time prior to dispatch (typically within 24 working hours of placement). If you need to cancel, contact our customer care via WhatsApp on ' + SITE.phone + ' or email ' + SITE.email + ' with your order number. Upon cancellation, a 100% refund is initiated immediately to your original payment method.'],
  ['The 7-day return window', 'Return any unworn piece within 7 days of delivery for a full refund. There is no restocking fee and no questions asked. The piece must be returned in its original jewellery box with tags intact.'],
  ['How to start a return', 'Contact us via WhatsApp, email, or our contact page with your order number and the items you wish to return. We arrange a reverse courier pickup where supported by pin code, or share a prepaid shipping label.'],
  ['Refund process & timelines', 'For prepaid orders (UPI, Cards, NetBanking), refunds are initiated within 24–48 hours of inspection and credited back to the original payment source within 5 to 7 business days as per banking standards. For Cash on Delivery orders, refunds are transferred directly via UPI or NEFT bank transfer to your nominated account within 3 business days.'],
  ['Exchanges', 'If you prefer a different size or piece, let us know when raising the return. We dispatch your exchange piece as soon as the original is picked up by our courier partner.'],
  ['Exceptions', 'For hygiene reasons, earrings must be returned in unworn condition. Pieces that have been customized, physically damaged, or subjected to direct chemical/perfume damage cannot be accepted.'],
  ['Six-month plating warranty', 'In addition to returns: every piece carries a 6-month warranty against plating tarnish under normal wear. Send a photo and order number to our team, and we will replace the piece free of charge.'],
];

export default function PolicyPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">Your assurance</span>
          <h1 className="display-lg mt-4">Cancellation & Returns</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mt-5 text-[12.5px] text-ink-3">Last updated 18 September 2026</p>
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
              Questions about this policy? Call or WhatsApp{' '}
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
