'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, Heart, User, X, ChevronRight } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useUI } from '@/store/ui';
import { cn } from '@/lib/utils';
import { SITE, OCCASIONS } from '@/lib/site';

export type NavCategory = { name: string; slug: string; tagline: string | null; image: string | null };

const ANNOUNCEMENTS = [
  'Complimentary shipping on all orders pan-India',
  'Hand-finished in Indore · 6-month plating warranty',
  'Use code WELCOME10 for 10% off your first order',
  'Easy 7-day returns · Nickel-free & skin safe',
];

export function AnnouncementBar() {
  return (
    <div className="overflow-hidden bg-ink py-2.5 text-canvas">
      <div className="flex w-max animate-marquee items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {ANNOUNCEMENTS.map((a) => (
              <span key={a} className="flex items-center whitespace-nowrap px-8 text-[10.5px] uppercase tracking-label">
                {a}
                <span className="ml-8 h-1 w-1 rotate-45 bg-gold" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader({ categories, user }: { categories: NavCategory[]; user: { name: string } | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const items = useCart((s) => s.items);
  const wishIds = useWishlist((s) => s.ids);
  const { openCart, openSearch, menuOpen, toggleMenu, closeMenu } = useUI();

  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    closeMenu();
    setMegaOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const primary = categories.slice(0, 5);

  return (
    <>
      <AnnouncementBar />

      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-all duration-300',
          scrolled ? 'border-line bg-canvas/92 backdrop-blur-md' : 'border-transparent bg-canvas',
        )}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="container-lux">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4 lg:py-5">
            {/* Left cluster */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMenu}
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center text-ink transition-colors hover:text-gold-deep lg:hidden"
              >
                <Menu size={19} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="hidden items-center gap-2.5 px-2 py-2 text-ink transition-colors hover:text-gold-deep lg:flex"
              >
                <Search size={17} strokeWidth={1.5} />
                <span className="label-muted text-ink-2">Search</span>
              </button>
            </div>

            {/* Wordmark */}
            <Link href="/" className="group flex flex-col items-center leading-none">
              <span className="font-display text-[26px] font-light tracking-[0.02em] text-ink transition-colors group-hover:text-gold-deep sm:text-[32px]">
                Radhe Krishna
              </span>
              <span className="mt-1 flex items-center gap-2">
                <span className="h-px w-5 bg-gold-soft" />
                <span className="label-muted text-[8.5px] tracking-[0.36em]">Jewellery</span>
                <span className="h-px w-5 bg-gold-soft" />
              </span>
            </Link>

            {/* Right cluster */}
            <div className="flex items-center justify-end gap-0.5">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="grid h-10 w-10 place-items-center text-ink transition-colors hover:text-gold-deep lg:hidden"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              <Link
                href={user ? '/account' : '/login'}
                aria-label={user ? 'Your account' : 'Sign in'}
                className="hidden h-10 items-center gap-2 px-3 text-ink transition-colors hover:text-gold-deep lg:flex"
              >
                <User size={17} strokeWidth={1.5} />
                <span className="label-muted text-ink-2">{user ? user.name.split(' ')[0] : 'Account'}</span>
              </Link>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative grid h-10 w-10 place-items-center text-ink transition-colors hover:text-gold-deep"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishIds.length > 0 ? (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-medium text-white">
                    {wishIds.length}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                onClick={openCart}
                aria-label={`Shopping bag, ${cartCount} items`}
                className="relative grid h-10 w-10 place-items-center text-ink transition-colors hover:text-gold-deep"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 ? (
                  <span className="absolute right-0.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-medium text-canvas">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          {/* Tighter gaps at lg keep every label on one line before xl opens it up. */}
          <nav className="hidden items-center justify-center gap-5 pb-4 lg:flex xl:gap-9">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((v) => !v)}
              className={cn(
                'label link-underline whitespace-nowrap py-1 text-ink hover:text-gold-deep',
                megaOpen && 'text-gold-deep',
              )}
            >
              All Collections
            </button>
            {primary.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onMouseEnter={() => setMegaOpen(false)}
                className={cn(
                  'label link-underline whitespace-nowrap py-1 text-ink hover:text-gold-deep',
                  pathname === `/category/${c.slug}` && 'text-gold-deep',
                )}
              >
                {c.name}
              </Link>
            ))}
            <Link href="/shop?occasion=Bridal" onMouseEnter={() => setMegaOpen(false)} className="label link-underline whitespace-nowrap py-1 text-wine hover:text-gold-deep">
              Bridal
            </Link>
            <Link href="/lookbook" onMouseEnter={() => setMegaOpen(false)} className="label link-underline whitespace-nowrap py-1 text-ink hover:text-gold-deep">
              Lookbook
            </Link>
          </nav>
        </div>

        {/* Mega menu */}
        <div
          className={cn(
            'absolute inset-x-0 top-full hidden overflow-hidden border-b border-line bg-canvas shadow-soft transition-all duration-300 lg:block',
            megaOpen ? 'max-h-[560px] opacity-100' : 'pointer-events-none max-h-0 opacity-0',
          )}
        >
          <div className="container-lux grid grid-cols-[1.6fr_1fr] gap-12 py-10">
            <div>
              <span className="label">Shop by category</span>
              <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-3">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="group flex items-center justify-between border-b border-line/70 py-2.5 transition-colors hover:border-gold"
                  >
                    <span>
                      <span className="block font-display text-lg text-ink transition-colors group-hover:text-gold-deep">
                        {c.name}
                      </span>
                      <span className="block text-[11px] text-ink-3">{c.tagline}</span>
                    </span>
                    <ChevronRight
                      size={15}
                      strokeWidth={1.5}
                      className="shrink-0 text-gold-soft transition-transform group-hover:translate-x-1 group-hover:text-gold"
                    />
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="label-muted mr-2">Shop by occasion</span>
                {OCCASIONS.map((o) => (
                  <Link
                    key={o}
                    href={`/shop?occasion=${encodeURIComponent(o)}`}
                    className="border border-line px-3 py-1.5 text-[11px] text-ink-2 transition-colors hover:border-gold hover:text-gold-deep"
                  >
                    {o}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/shop?occasion=Bridal" className="group relative block overflow-hidden">
              {categories[6]?.image ? (
                <Image
                  src={categories[6].image}
                  alt="Bridal collection"
                  width={640}
                  height={520}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7 text-canvas">
                <span className="label text-gold-soft">The Bridal Edit</span>
                <p className="mt-2 font-display text-3xl font-light leading-tight">Complete trousseau suites</p>
                <span className="mt-3 inline-block text-[11px] uppercase tracking-label underline underline-offset-4">
                  Explore
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu categories={categories} user={user} open={menuOpen} onClose={closeMenu} />
    </>
  );
}

function MobileMenu({
  categories,
  user,
  open,
  onClose,
}: {
  categories: NavCategory[];
  user: { name: string } | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
      <div
        className={cn('absolute inset-0 bg-ink/45 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-canvas transition-transform duration-400 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-xl">Menu</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-ink hover:text-gold-deep">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <span className="label">Collections</span>
          <div className="mt-4 flex flex-col">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={onClose}
                className="flex items-center justify-between border-b border-line py-3.5 font-display text-xl text-ink"
              >
                {c.name}
                <ChevronRight size={16} strokeWidth={1.5} className="text-gold-soft" />
              </Link>
            ))}
          </div>

          <span className="label mt-9 block">Occasion</span>
          <div className="mt-4 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <Link
                key={o}
                href={`/shop?occasion=${encodeURIComponent(o)}`}
                onClick={onClose}
                className="border border-line px-3 py-2 text-xs text-ink-2"
              >
                {o}
              </Link>
            ))}
          </div>

          <span className="label mt-9 block">More</span>
          <div className="mt-3 flex flex-col gap-3 text-sm text-ink-2">
            <Link href="/shop" onClick={onClose}>Shop all</Link>
            <Link href="/lookbook" onClick={onClose}>Lookbook</Link>
            <Link href="/about" onClick={onClose}>Our story</Link>
            <Link href="/contact" onClick={onClose}>Contact</Link>
            <Link href="/faq" onClick={onClose}>FAQ</Link>
            <Link href={user ? '/account' : '/login'} onClick={onClose}>
              {user ? `Account — ${user.name.split(' ')[0]}` : 'Sign in / Register'}
            </Link>
          </div>
        </div>

        <div className="border-t border-line px-6 py-5">
          <a href={SITE.phoneHref} className="label-muted block">
            {SITE.phone}
          </a>
          <span className="mt-1 block text-[11px] text-ink-3">{SITE.hours}</span>
        </div>
      </div>
    </div>
  );
}
