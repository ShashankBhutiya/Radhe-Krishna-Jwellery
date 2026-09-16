'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import { cn, inr } from '@/lib/utils';
import { SITE } from '@/lib/site';

export function CartDrawer() {
  const { items, setQty, remove, subtotal, savings } = useCart();
  const { cartOpen, closeCart } = useUI();

  const total = subtotal();
  const saved = savings();
  const shipping = total >= SITE.freeShippingAbove || total === 0 ? 0 : SITE.shippingFlat;
  const toFreeShip = Math.max(0, SITE.freeShippingAbove - total);
  const progress = Math.min(100, (total / SITE.freeShippingAbove) * 100);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeCart]);

  return (
    <div className={cn('fixed inset-0 z-50', cartOpen ? 'visible' : 'invisible')} aria-hidden={!cartOpen}>
      <div
        className={cn('absolute inset-0 bg-ink/45 backdrop-blur-sm transition-opacity duration-300', cartOpen ? 'opacity-100' : 'opacity-0')}
        onClick={closeCart}
      />

      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-canvas transition-transform duration-400 ease-out',
          cartOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-2xl font-light">Your Bag</h2>
            <span className="text-xs text-ink-3">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close bag" className="text-ink hover:text-gold-deep">
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {items.length > 0 ? (
          <div className="border-b border-line bg-canvas-2 px-6 py-3.5">
            <p className="text-[11.5px] text-ink-2">
              {toFreeShip > 0 ? (
                <>
                  Add <strong className="font-medium text-gold-deep">{inr(toFreeShip)}</strong> more for complimentary shipping
                </>
              ) : (
                <span className="font-medium text-gold-deep">You have unlocked complimentary shipping</span>
              )}
            </p>
            <div className="mt-2 h-[3px] w-full bg-line">
              <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={34} strokeWidth={1} className="text-gold-soft" />
              <p className="font-display text-2xl font-light">Your bag is empty</p>
              <p className="max-w-[26ch] text-sm text-ink-2">
                Every piece is hand-finished and made to be worn more than once.
              </p>
              <button type="button" onClick={closeCart} className="btn-outline btn-sm mt-2">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link href={`/product/${item.slug}`} onClick={closeCart} className="relative h-[104px] w-20 shrink-0 overflow-hidden bg-canvas-2">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" /> : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="block font-display text-[17px] leading-snug hover:text-gold-deep"
                      >
                        {item.name}
                      </Link>
                      <span className="mt-1 block text-sm text-ink-2">{inr(item.price)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid h-8 w-8 place-items-center text-ink-2 hover:text-gold-deep"
                        >
                          <Minus size={12} strokeWidth={1.8} />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          disabled={item.qty >= item.stock}
                          aria-label="Increase quantity"
                          className="grid h-8 w-8 place-items-center text-ink-2 hover:text-gold-deep disabled:opacity-30"
                        >
                          <Plus size={12} strokeWidth={1.8} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-ink-3 transition-colors hover:text-wine"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <footer className="border-t border-line px-6 py-5">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd className="font-medium">{inr(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">Shipping</dt>
                <dd className={shipping === 0 ? 'text-gold-deep' : ''}>{shipping === 0 ? 'Complimentary' : inr(shipping)}</dd>
              </div>
              {saved > 0 ? (
                <div className="flex justify-between text-gold-deep">
                  <dt>You save</dt>
                  <dd>{inr(saved)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="label">Total</dt>
                <dd className="font-display text-2xl">{inr(total + shipping)}</dd>
              </div>
            </dl>

            <Link href="/checkout" onClick={closeCart} className="btn-primary mt-5 w-full">
              Proceed to checkout
            </Link>
            <Link href="/cart" onClick={closeCart} className="mt-3 block text-center text-[11px] uppercase tracking-label text-ink-2 hover:text-gold-deep">
              View full bag
            </Link>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
