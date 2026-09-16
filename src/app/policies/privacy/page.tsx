import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for ' + SITE.name + '.',
};

const SECTIONS: [string, string][] = [
  ['What we collect', 'Your name, email, phone number and delivery address when you place an order or create an account. If you subscribe to the newsletter we store only your email address.'],
  ['Why we collect it', 'To fulfil and deliver your order, to contact you about that order, and to handle returns or warranty claims. With your consent, to send occasional collection updates. Nothing else.'],
  ['Payment information', 'We never see or store card numbers, UPI IDs or bank credentials. When a live payment gateway is connected, those details go directly to the gateway and never touch our servers.'],
  ['Who we share with', 'Only the courier that delivers your parcel, and only the name, address and phone number needed to complete delivery. We do not sell, rent or trade customer data to anyone, for any purpose.'],
  ['Cookies', 'We use a single session cookie to keep you signed in, and browser storage on your own device to remember your bag and wishlist. There is no third-party advertising or cross-site tracking on this site.'],
  ['Your rights', 'Write to us at any time to see what we hold about you, correct it, or have it deleted. We action deletion requests within 30 days, keeping only what tax law requires us to retain on past invoices.'],
];

export default function PolicyPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">Your information</span>
          <h1 className="display-lg mt-4">Privacy policy</h1>
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
