'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, Check, ShieldCheck, Truck, RotateCcw, Gem } from 'lucide-react';
import { SITE, addressLine } from '@/lib/site';
import { Spinner } from '@/components/ui';
import type { NavCategory } from '@/components/site-header';

export function TrustBar() {
  const items = [
    { icon: Truck, title: 'Free shipping on all orders', copy: 'Dispatched within 24 hours, pan-India' },
    { icon: RotateCcw, title: '7-day easy returns', copy: 'No questions, no restocking fee' },
    { icon: ShieldCheck, title: '6-month plating warranty', copy: 'Against normal wear and tarnish' },
    { icon: Gem, title: 'Nickel & lead free', copy: 'Safe for sensitive skin' },
  ];
  return (
    <section className="border-y border-line bg-canvas-2">
      <div className="container-lux grid grid-cols-2 gap-y-8 py-12 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex flex-col items-center gap-2.5 px-3 text-center">
            <it.icon size={22} strokeWidth={1.2} className="text-gold" />
            <span className="font-display text-[17px] leading-tight">{it.title}</span>
            <span className="text-[11.5px] leading-relaxed text-ink-3">{it.copy}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setState('done');
      setMsg(data.message ?? 'You are on the list.');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (state === 'done') {
    return (
      <p className="flex items-center gap-2 text-sm text-gold-deep">
        <Check size={16} strokeWidth={1.8} /> {msg}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? 'w-full' : 'mx-auto w-full max-w-md'}>
      <div className="flex items-center border-b border-ink/25 focus-within:border-gold">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-transparent py-3 text-sm placeholder:text-ink-3/70 focus:outline-none"
          aria-label="Email address"
        />
        <button type="submit" disabled={state === 'loading'} className="btn shrink-0 py-3 pl-4 text-ink hover:text-gold-deep">
          {state === 'loading' ? <Spinner /> : 'Subscribe'}
        </button>
      </div>
      {state === 'error' ? <p className="mt-2 text-xs text-wine">{msg}</p> : null}
    </form>
  );
}

export function SiteFooter({ categories }: { categories: NavCategory[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-canvas/85">
      <div className="container-lux py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <span className="font-display text-3xl font-light text-canvas">Radhe Krishna</span>
            <span className="mt-1.5 flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              <span className="text-[8.5px] uppercase tracking-[0.36em] text-gold-soft">Jewellery</span>
            </span>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-canvas/60">{SITE.description}</p>

            <div className="mt-7 flex gap-3">
              {[
                { href: SITE.social.instagram, icon: Instagram, label: 'Instagram' },
                { href: SITE.social.facebook, icon: Facebook, label: 'Facebook' },
                { href: SITE.social.youtube, icon: Youtube, label: 'YouTube' },
              ]
                .filter((s) => s.href)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center border border-canvas/20 transition-colors hover:border-gold hover:text-gold"
                  >
                    <s.icon size={15} strokeWidth={1.5} />
                  </a>
                ))}
            </div>
          </div>

          <nav aria-label="Collections">
            <span className="label text-gold-soft">Collections</span>
            <ul className="mt-5 space-y-2.5 text-[13px]">
              {categories.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="link-underline text-canvas/70 hover:text-canvas">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="link-underline text-canvas/70 hover:text-canvas">
                  Shop all
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Help">
            <span className="label text-gold-soft">Help</span>
            <ul className="mt-5 space-y-2.5 text-[13px]">
              {[
                { href: '/contact', label: 'Contact us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/policies/shipping', label: 'Shipping' },
                { href: '/policies/returns', label: 'Cancellation & refunds' },
                { href: '/policies/privacy', label: 'Privacy policy' },
                { href: '/policies/terms', label: 'Terms of service' },
                { href: '/about', label: 'Our story' },
                { href: '/account/orders', label: 'Track your order' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-canvas/70 hover:text-canvas">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <span className="label text-gold-soft">The atelier letter</span>
            <p className="mt-5 text-[13px] leading-relaxed text-canvas/60">
              New collections, styling notes and early access to festive drops. No more than twice a month.
            </p>
            <div className="mt-4 [&_input]:text-canvas [&_input]:placeholder:text-canvas/40 [&_.btn]:text-canvas [&>form>div]:border-canvas/25">
              <NewsletterForm compact />
            </div>

            <address className="mt-8 space-y-2.5 not-italic text-[12.5px] text-canvas/60">
              <span className="flex items-start gap-2.5">
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-gold" />
                {addressLine()}
              </span>
              <a href={SITE.phoneHref} className="flex items-center gap-2.5 hover:text-canvas">
                <Phone size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                {SITE.phone}
              </a>
              {SITE.email ? (
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 hover:text-canvas">
                  <Mail size={14} strokeWidth={1.5} className="shrink-0 text-gold" />
                  {SITE.email}
                </a>
              ) : null}
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-canvas/12 pt-7 text-[11px] text-canvas/45 sm:flex-row">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rotate-45 bg-gold" />
            Hand-finished in {SITE.address.city}, India
          </p>
        </div>
      </div>
    </footer>
  );
}
