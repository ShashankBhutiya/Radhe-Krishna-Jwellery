'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown, Star, Check } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useRecent, useUI } from '@/store/ui';
import { WishlistButton } from '@/components/product-card';
import { Stars, Spinner } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

type Img = { id: string; url: string; alt: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const current = images[active];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row lg:gap-5">
      <div className="no-scrollbar flex gap-3 overflow-x-auto lg:w-[84px] lg:flex-col lg:overflow-visible">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              'relative aspect-[4/5] w-[68px] shrink-0 overflow-hidden border transition-all lg:w-full',
              i === active ? 'border-gold' : 'border-line hover:border-gold-soft',
            )}
          >
            <Image src={img.url} alt="" fill sizes="84px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-canvas-2"
      >
        {current ? (
          <Image
            src={current.url}
            alt={current.alt || name}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-200"
            style={
              zoom
                ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : undefined
            }
          />
        ) : null}
        {/* Hidden on touch widths, where there is no hover to invite. */}
        <span className="pointer-events-none absolute bottom-3 right-3 hidden bg-canvas/85 px-2.5 py-1 text-[9.5px] uppercase tracking-label text-ink-2 backdrop-blur lg:block">
          Hover to zoom
        </span>
      </div>
    </div>
  );
}

export function AddToCartPanel({
  product,
}: {
  product: { id: string; name: string; slug: string; price: number; mrp: number; stock: number; image: string };
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const toast = useUI((s) => s.toast);
  const router = useRouter();

  const soldOut = product.stock <= 0;
  const low = product.stock > 0 && product.stock <= 5;

  function addToBag(then?: () => void) {
    if (soldOut) return;
    add(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    if (then) then();
    else {
      toast(`${product.name} added to your bag`);
      openCart();
    }
  }

  return (
    <div>
      {low ? (
        <p className="mb-4 inline-flex items-center gap-2 bg-wine/8 px-3 py-2 text-[12px] text-wine">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-wine" />
          Only {product.stock} left in stock
        </p>
      ) : null}

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex items-center border border-line bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            disabled={soldOut}
            className="grid h-full w-11 place-items-center text-ink-2 hover:text-gold-deep disabled:opacity-40"
          >
            <Minus size={13} strokeWidth={1.8} />
          </button>
          <span className="w-9 text-center text-sm tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
            disabled={soldOut || qty >= product.stock}
            className="grid h-full w-11 place-items-center text-ink-2 hover:text-gold-deep disabled:opacity-40"
          >
            <Plus size={13} strokeWidth={1.8} />
          </button>
        </div>

        {/*
          Narrow screens: quantity and wishlist share the first row, "Add to bag"
          takes the second in full. From sm the three sit on one row, with the
          order numbers restoring qty → add → wishlist.
        */}
        <button
          type="button"
          onClick={() => addToBag()}
          disabled={soldOut}
          className="btn-primary order-2 w-full sm:w-auto sm:flex-1 sm:min-w-[180px]"
        >
          {added ? (
            <>
              <Check size={14} strokeWidth={2} /> Added
            </>
          ) : soldOut ? (
            'Sold out'
          ) : (
            <>
              <ShoppingBag size={14} strokeWidth={1.7} /> Add to bag
            </>
          )}
        </button>

        <WishlistButton productId={product.id} className="order-1 ml-auto h-auto w-14 sm:order-3 sm:ml-0" size={18} />
      </div>

      <button
        type="button"
        onClick={() => addToBag(() => router.push('/checkout'))}
        disabled={soldOut}
        className="btn-gold mt-3 w-full"
      >
        Buy it now
      </button>

      <ul className="mt-7 grid gap-3 border-t border-line pt-6 text-[13px] text-ink-2">
        {[
          { icon: Truck, text: 'Free shipping on all orders · dispatched in 24 hours' },
          { icon: RotateCcw, text: '7-day returns, no restocking fee' },
          { icon: ShieldCheck, text: '6-month plating warranty · nickel-free' },
        ].map((r) => (
          <li key={r.text} className="flex items-center gap-3">
            <r.icon size={15} strokeWidth={1.4} className="shrink-0 text-gold" />
            {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: { title: string; content: React.ReactNode }[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="mt-10 border-t border-line">
      {items.map((it, i) => (
        <div key={it.title} className="border-b border-line">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between py-4 text-left"
          >
            <span className="label text-ink">{it.title}</span>
            <ChevronDown size={15} strokeWidth={1.6} className={cn('text-ink-3 transition-transform', open === i && 'rotate-180')} />
          </button>
          <div className={cn('grid transition-all duration-300', open === i ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden text-[14px] leading-[1.75] text-ink-2">{it.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackRecentView({ productId }: { productId: string }) {
  const push = useRecent((s) => s.push);
  useEffect(() => {
    push(productId);
  }, [productId, push]);
  return null;
}

type Review = { id: string; authorName: string; rating: number; title: string; body: string; createdAt: string | Date };

export function ReviewsSection({
  productId,
  reviews,
  rating,
  signedInName,
}: {
  productId: string;
  reviews: Review[];
  rating: number;
  signedInName: string | null;
}) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ title: '', body: '', authorName: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: stars,
          title: form.title,
          body: form.body,
          authorName: signedInName ?? form.authorName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not post your review');

      toast('Thank you — your review is live');
      setForm({ title: '', body: '', authorName: '' });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews" className="border-t border-line pt-16">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-20">
        <div>
          <span className="label">Customer reviews</span>
          <h2 className="display-md mt-3">
            {reviews.length ? `${rating} out of 5` : 'No reviews yet'}
          </h2>
          <div className="mt-3">
            <Stars rating={rating} size={16} />
          </div>
          <p className="mt-2 text-[12.5px] text-ink-3">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>

          {reviews.length > 0 ? (
            <div className="mt-6 space-y-2">
              {buckets.map((b) => (
                <div key={b.n} className="flex items-center gap-3 text-[12px] text-ink-3">
                  <span className="w-8 shrink-0">{b.n} ★</span>
                  <span className="h-[5px] flex-1 bg-line">
                    <span
                      className="block h-full bg-gold"
                      style={{ width: `${reviews.length ? (b.count / reviews.length) * 100 : 0}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          ) : null}

          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-outline mt-8 w-full">
            {showForm ? 'Cancel' : 'Write a review'}
          </button>
        </div>

        <div>
          {showForm ? (
            <form onSubmit={submit} className="card-surface mb-10 p-6 animate-rise">
              <span className="label">Your rating</span>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={24}
                      strokeWidth={1.3}
                      className={cn(n <= (hover || stars) ? 'fill-gold text-gold' : 'fill-transparent text-gold-soft')}
                    />
                  </button>
                ))}
              </div>

              {!signedInName ? (
                <div className="mt-5">
                  <label className="field-label" htmlFor="rv-name">Your name</label>
                  <input
                    id="rv-name"
                    required
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    className="field"
                    placeholder="Ananya S."
                  />
                </div>
              ) : null}

              <div className="mt-5">
                <label className="field-label" htmlFor="rv-title">Headline</label>
                <input
                  id="rv-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="field"
                  placeholder="Looks far costlier than it is"
                />
              </div>

              <div className="mt-5">
                <label className="field-label" htmlFor="rv-body">Your review</label>
                <textarea
                  id="rv-body"
                  required
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="field resize-none"
                  placeholder="How does it feel to wear? How was the finish and the fit?"
                />
              </div>

              {error ? <p className="mt-4 text-[13px] text-wine">{error}</p> : null}

              <button type="submit" disabled={busy} className="btn-primary mt-6">
                {busy ? <Spinner /> : 'Post review'}
              </button>
            </form>
          ) : null}

          {reviews.length === 0 ? (
            <p className="text-sm text-ink-2">Be the first to review this piece.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-7 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Stars rating={r.rating} size={13} />
                    <span className="text-[11.5px] text-ink-3">{formatDate(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl">{r.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.75] text-ink-2">{r.body}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-label text-ink-3">{r.authorName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
