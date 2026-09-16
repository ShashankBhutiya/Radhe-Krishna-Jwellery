import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqAccordion } from '@/components/faq-accordion';
import { SITE } from '@/lib/site';
import { inr } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description: 'Sizing, shipping, returns, care and warranty — answered.',
};

const SECTIONS = [
  {
    title: 'Orders & shipping',
    items: [
      ['How long does delivery take?', 'Orders are dispatched from Indore within 24 working hours. Metro cities receive them in 2 to 4 days, the rest of India in 4 to 7 days. You will get a tracking link by email the moment the parcel leaves us.'],
      ['Do you charge for shipping?', 'Shipping is complimentary on orders above ' + inr(SITE.freeShippingAbove) + '. Below that a flat ' + inr(SITE.shippingFlat) + ' applies. Cash on delivery carries no extra charge anywhere in India.'],
      ['Can I change my delivery address after ordering?', 'Yes, as long as the parcel has not shipped. Call us on ' + SITE.phone + ' with your order number and we will update it.'],
      ['Do you ship internationally?', 'Not yet through the website. For international orders, message us on WhatsApp with your city and we will quote a courier rate.'],
    ],
  },
  {
    title: 'Returns & warranty',
    items: [
      ['What is your return policy?', 'Return any unworn piece within 7 days of delivery for a full refund. No restocking fee, no explanation required. Keep the original box and tags — that is the only condition.'],
      ['How does the six-month warranty work?', 'If the plating wears through under normal use within six months, email us a photo and your order number. We replace the piece free. It does not cover damage from water, perfume applied directly, or physical impact.'],
      ['How long do refunds take?', 'Once the returned parcel reaches us, refunds are issued within 3 working days. Bank processing adds another 2 to 5 days depending on your bank.'],
      ['Can I exchange for a different piece?', 'Yes. Tell us what you would like instead when you raise the return and we will ship the replacement as soon as the original is on its way back.'],
    ],
  },
  {
    title: 'Product & care',
    items: [
      ['Is this real gold?', 'No. Everything on this site is imitation jewellery: a solid brass base with a triple-dipped gold or silver-tone plating and hand-set stones. It is designed to look and weigh like fine jewellery at a fraction of the cost, and we never claim otherwise.'],
      ['Will it turn my skin green?', 'No. The entire catalogue is nickel-free and lead-free, and the closed-back settings keep the base metal off your skin. If you have a reaction, return it and we will refund you in full.'],
      ['How do I make the plating last?', 'Put jewellery on last, after perfume and lotion have dried. Wipe it with the flannel cloth included in the box after each wear. Store each piece in its own anti-tarnish pouch, and remove it before bathing or swimming.'],
      ['Are bangle sizes adjustable?', 'Bangles come in standard Indian sizes 2.4 to 2.10 and are listed per piece. Rings, bracelets and anklets in the catalogue are adjustable unless the description says otherwise.'],
    ],
  },
  {
    title: 'Payment & account',
    items: [
      ['What payment methods do you accept?', 'Cash on delivery is available nationwide. Online payment through UPI, card and netbanking is shown at checkout — on this demonstration build the online option is simulated and no money moves.'],
      ['Do I need an account to order?', 'No. You can check out as a guest. An account simply lets you track orders, save addresses and keep your wishlist across devices.'],
      ['How do I use a coupon?', 'Enter it in the coupon box on the cart or checkout page and press Apply. Only one code applies per order, and the discount shows in the summary before you pay.'],
      ['Do you offer bulk pricing?', 'Yes, from 20 pieces upward, with matched finishes across the batch. Send the quantity and date through the contact page and we will quote the same day.'],
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">Good to know</span>
          <h1 className="display-lg mt-4">Frequently asked</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
        </div>
      </header>

      <div className="container-lux py-14 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-14">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="display-md">{s.title}</h2>
              <FaqAccordion items={s.items.map(([q, a]) => ({ q, a }))} />
            </section>
          ))}

          <div className="border border-line bg-canvas-2 px-8 py-12 text-center">
            <h2 className="display-md">Still stuck?</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
              Call {SITE.phone} during shop hours, or send us a message and we will reply within one working day.
            </p>
            <Link href="/contact" className="btn-primary mt-7">Contact us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
