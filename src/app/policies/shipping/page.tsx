import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Shipping policy',
  description: 'Shipping policy for ' + SITE.name + '.',
};

const SECTIONS: [string, string][] = [
  ['Dispatch times', 'Every order is packed and handed to the courier within 24 working hours of being placed. Orders placed on Sunday or a public holiday are dispatched the next working morning.'],
  ['Delivery estimates', 'Metro cities: 2 to 4 working days. Tier-two cities and towns: 3 to 5 working days. Remote pin codes and the North East: 5 to 8 working days. These are courier estimates, not guarantees, and festive weeks run slower across the industry.'],
  ['Charges', 'Shipping is complimentary on every order above the free-shipping threshold shown in your cart. Below it, a single flat rate applies regardless of weight or destination. Cash on delivery carries no additional fee anywhere in India.'],
  ['Tracking', 'A tracking link is emailed the moment the parcel leaves our workshop, and again if the courier reschedules. Signed-in customers can also follow the order from the account area.'],
  ['Failed deliveries', 'Couriers attempt delivery three times. If all three fail, the parcel returns to us and we refund the order minus the actual return-shipping cost. Please make sure the phone number on the order is reachable.'],
  ['International orders', 'We do not ship outside India through the website yet. Message us on WhatsApp with your destination city and we will quote a courier rate directly.'],
];

export default function PolicyPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">Getting it to you</span>
          <h1 className="display-lg mt-4">Shipping policy</h1>
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
