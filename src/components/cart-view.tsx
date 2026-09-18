'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Tag, ArrowRight, X } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import { WishlistButton } from '@/components/product-card';
import { Empty, Spinner } from '@/components/ui';
import { cn, inr } from '@/lib/utils';
import { SITE } from '@/lib/site';

export type AppliedCoupon = { code: string; discount: number; freeShipping: boolean; description: string };

const COUPON_KEY = 'rk-coupon';

/** Coupon state is shared between the cart and checkout via sessionStorage. */
export function useCoupon(subtotal: number) {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COUPON_KEY);
      if (raw) setCoupon(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
  }, []);

  // A coupon can stop qualifying if items are removed, so re-validate on change.
  useEffect(() => {
    if (!coupon) return;
    let cancelled = false;

    fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon.code, subtotal }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        const next = { code: d.code, discount: d.discount, freeShipping: !!d.freeShipping, description: d.description };
        setCoupon(next);
        sessionStorage.setItem(COUPON_KEY, JSON.stringify(next));
      })
      .catch(() => {
        if (cancelled) return;
        setCoupon(null);
        sessionStorage.removeItem(COUPON_KEY);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  function apply(c: AppliedCoupon | null) {
    setCoupon(c);
    try {
      if (c) sessionStorage.setItem(COUPON_KEY, JSON.stringify(c));
      else sessionStorage.removeItem(COUPON_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  return { coupon, apply };
}

export function CouponBox({
  subtotal,
  coupon,
  onApply,
}: {
  subtotal: number;
  coupon: AppliedCoupon | null;
  onApply: (c: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!code.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'That code is not valid.');
      onApply({ code: data.code, discount: data.discount, freeShipping: !!data.freeShipping, description: data.description });
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-start justify-between gap-3 border border-gold/40 bg-gold-pale px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Tag size={14} strokeWidth={1.6} className="mt-0.5 shrink-0 text-gold-deep" />
          <div>
            <span className="block text-[13px] font-medium text-ink">{coupon.code} applied</span>
            <span className="block text-[11.5px] text-ink-2">{coupon.description}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onApply(null)}
          aria-label="Remove coupon"
          className="shrink-0 text-ink-3 hover:text-wine"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>
    );
  }

  // Deliberately not a <form>: on the checkout page this renders inside the
  // main checkout form, and nested forms are invalid HTML — the browser drops
  // the inner one, which would turn Apply into a checkout submit button.
  return (
    <div>
      <label className="field-label" htmlFor="coupon">Have a coupon?</label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="WELCOME10"
          className="field flex-1 uppercase tracking-wider"
        />
        <button type="button" onClick={submit} disabled={busy} className="btn-outline shrink-0 px-6 py-3">
          {busy ? <Spinner /> : 'Apply'}
        </button>
      </div>
      {error ? <p className="mt-2 text-[12.5px] text-wine">{error}</p> : null}
      <p className="mt-2 text-[11.5px] text-ink-3">Try WELCOME10, FESTIVE500 or FREESHIP.</p>
    </div>
  );
}

export function OrderSummary({
  subtotal,
  discount,
  shipping,
  savings,
  children,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  savings: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="card-surface p-6 lg:p-7">
      <h2 className="font-display text-2xl font-light">Order summary</h2>
      <span className="mt-4 block h-px w-full bg-line" />

      <dl className="mt-5 space-y-3 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-ink-2">Subtotal</dt>
          <dd>{inr(subtotal)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-gold-deep">
            <dt>Coupon discount</dt>
            <dd>− {inr(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-ink-2">Shipping</dt>
          <dd className={shipping === 0 ? 'text-gold-deep' : ''}>{shipping === 0 ? 'Complimentary' : inr(shipping)}</dd>
        </div>
        {savings > 0 ? (
          <div className="flex justify-between text-[12.5px] text-ink-3">
            <dt>You save vs. MRP</dt>
            <dd>{inr(savings)}</dd>
          </div>
        ) : null}

        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <dt className="label text-ink">Total</dt>
          <dd className="font-display text-3xl font-light">{inr(subtotal - discount + shipping)}</dd>
        </div>
      </dl>

      {children}
    </div>
  );
}

export function CartView() {
  const { items, setQty, remove, subtotal, savings } = useCart();
  const toast = useUI((s) => s.toast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sub = subtotal();
  const { coupon, apply } = useCoupon(sub);

  const discount = coupon?.discount ?? 0;
  const shipping = 0;

  if (!mounted) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-5">
              <div className="skeleton h-40 w-32" />
              <div className="flex-1 space-y-3 py-3">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-72 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        title="Your bag is empty"
        copy="Nothing saved yet. Browse the collection — every piece is hand-finished and made to be worn more than once."
        action={{ href: '/shop', label: 'Start shopping' }}
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <div>
        <div className="hidden border-b border-line pb-3 lg:grid lg:grid-cols-[1fr_140px_120px] lg:gap-4">
          <span className="label-muted">Piece</span>
          <span className="label-muted text-center">Quantity</span>
          <span className="label-muted text-right">Total</span>
        </div>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="grid gap-4 py-6 lg:grid-cols-[1fr_140px_120px] lg:items-center lg:gap-4">
              <div className="flex gap-5">
                <Link href={`/product/${item.slug}`} className="relative h-36 w-28 shrink-0 overflow-hidden bg-canvas-2">
                  {item.image ? <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" /> : null}
                </Link>

                <div className="flex min-w-0 flex-col justify-center gap-1.5">
                  <Link href={`/product/${item.slug}`} className="font-display text-[21px] leading-tight hover:text-gold-deep">
                    {item.name}
                  </Link>
                  <span className="text-sm text-ink-2">{inr(item.price)} each</span>
                  {item.mrp > item.price ? (
                    <span className="text-[12px] text-ink-3">
                      <span className="line-through">{inr(item.mrp)}</span>{' '}
                      <span className="text-gold-deep">save {inr(item.mrp - item.price)}</span>
                    </span>
                  ) : null}

                  <div className="mt-1 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        remove(item.id);
                        toast(`${item.name} removed`);
                      }}
                      className="flex items-center gap-1.5 text-[11px] uppercase tracking-label text-ink-3 hover:text-wine"
                    >
                      <Trash2 size={12} strokeWidth={1.6} /> Remove
                    </button>
                    <WishlistButton productId={item.id} className="h-7 w-7" size={13} />
                  </div>
                </div>
              </div>

              <div className="flex lg:justify-center">
                <div className="flex items-center border border-line bg-white">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    aria-label="Decrease quantity"
                    className="grid h-10 w-10 place-items-center text-ink-2 hover:text-gold-deep"
                  >
                    <Minus size={12} strokeWidth={1.8} />
                  </button>
                  <span className="w-9 text-center text-sm tabular-nums">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    aria-label="Increase quantity"
                    className="grid h-10 w-10 place-items-center text-ink-2 hover:text-gold-deep disabled:opacity-30"
                  >
                    <Plus size={12} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              <span className="font-display text-xl lg:text-right">{inr(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>

        <Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-label text-ink-2 hover:text-gold-deep">
          Continue shopping
        </Link>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="mb-5">
          <CouponBox subtotal={sub} coupon={coupon} onApply={apply} />
        </div>

        <OrderSummary subtotal={sub} discount={discount} shipping={shipping} savings={savings()}>
          <Link href="/checkout" className="btn-primary group mt-6 w-full">
            Proceed to checkout
            <ArrowRight size={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-3">
            Taxes included. Cash on delivery available nationwide.
          </p>
        </OrderSummary>
      </aside>
    </div>
  );
}
