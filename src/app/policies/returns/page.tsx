import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Returns & exchanges',
  description: 'Returns & exchanges for ' + SITE.name + '.',
};

const SECTIONS: [string, string][] = [
  ['The 7-day window', 'Return any unworn piece within 7 days of delivery for a full refund. There is no restocking fee and you do not need to give a reason. The piece must come back in its original box with tags attached.'],
  ['How to start a return', 'Email us or use the contact page with your order number and which pieces you are returning. We arrange a reverse pickup where the pin code allows it, and share a prepaid label where it does not.'],
  ['Exchanges', 'Tell us which piece you would prefer when you raise the return. We ship the replacement as soon as the original is scanned into the return courier, so you are not waiting twice.'],
  ['Refund timing', 'Refunds are issued within 3 working days of the returned parcel reaching us. Your bank typically takes another 2 to 5 days to show the credit. Cash-on-delivery orders are refunded by bank transfer to an account you nominate.'],
  ['What we cannot accept', 'Pieces that have been worn, resized, or damaged after delivery, and anything returned without its original packaging. Earrings can be returned but for hygiene reasons only in unworn condition with the seal intact.'],
  ['Six-month plating warranty', 'Separate from returns: if the plating wears through under normal use within six months, send a photo and your order number and we replace the piece free of charge. Damage from water, direct perfume contact or impact is not covered.'],
];

export default function PolicyPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">If it is not right</span>
          <h1 className="display-lg mt-4">Returns & exchanges</h1>
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
