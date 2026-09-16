'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { useUI } from '@/store/ui';
import { cn, discountPct } from '@/lib/utils';
import { Price, Stars, Badge } from '@/components/ui';
import type { CardProduct } from '@/lib/queries';

export function WishlistButton({
  productId,
  className,
  size = 16,
}: {
  productId: string;
  className?: string;
  size?: number;
}) {
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);
  const active = ids.includes(productId);

  return (
    <button
      type="button"
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
        toast(active ? 'Removed from your wishlist' : 'Saved to your wishlist');
      }}
      className={cn(
        'grid h-9 w-9 place-items-center border border-line bg-white/90 backdrop-blur transition-all duration-300 hover:border-gold hover:text-gold',
        active && 'border-gold text-gold',
        className,
      )}
    >
      <Heart size={size} strokeWidth={1.6} className={cn(active && 'fill-gold')} />
    </button>
  );
}

export function ProductCard({ product, index = 0 }: { product: CardProduct; index?: number }) {
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const toast = useUI((s) => s.toast);

  const img = product.images[0]?.url;
  const hoverImg = product.images[1]?.url ?? img;
  const off = discountPct(product.price, product.mrp);
  const soldOut = product.stock <= 0;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: img ?? '',
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
    });
    toast(`${product.name} added to your bag`);
    openCart();
  }

  return (
    <article className="group animate-rise" style={{ '--i': index } as React.CSSProperties}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-canvas-2">
          {img ? (
            <>
              <Image
                src={img}
                alt={product.images[0]?.alt || product.name}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.06] group-hover:opacity-0"
              />
              <Image
                src={hoverImg}
                alt=""
                aria-hidden
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="scale-[1.06] object-cover opacity-0 transition-all duration-[900ms] ease-out group-hover:scale-100 group-hover:opacity-100"
              />
            </>
          ) : (
            <div className="h-full w-full skeleton" />
          )}

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {soldOut ? <Badge tone="ink">Sold out</Badge> : null}
            {!soldOut && product.isNew ? <Badge tone="gold">New</Badge> : null}
            {!soldOut && !product.isNew && product.isBestseller ? <Badge tone="wine">Bestseller</Badge> : null}
            {!soldOut && off >= 40 ? <Badge tone="muted">{off}% off</Badge> : null}
          </div>

          <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
            <WishlistButton productId={product.id} />
          </div>

          {/* Quick-add slides up from the bottom edge on hover. */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-400 ease-out group-hover:translate-y-0 focus-within:translate-y-0">
            <button
              type="button"
              onClick={quickAdd}
              disabled={soldOut}
              className="flex w-full items-center justify-center gap-2 bg-ink/95 py-3.5 font-sans text-[10.5px] font-medium uppercase tracking-label text-canvas backdrop-blur transition-colors hover:bg-gold-deep disabled:bg-ink-3"
            >
              <ShoppingBag size={13} strokeWidth={1.6} />
              {soldOut ? 'Notify me' : 'Quick add'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 pt-4">
          <span className="label-muted">{product.category.name}</span>
          <h3 className="font-display text-[19px] font-normal leading-snug text-ink transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
          {product.reviewCount > 0 ? <Stars rating={product.rating} count={product.reviewCount} /> : null}
          <div className="pt-0.5">
            <Price price={product.price} mrp={product.mrp} size="sm" />
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({
  products,
  cols = 4,
}: {
  products: CardProduct[];
  cols?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        'stagger grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-7',
        cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        'md:grid-cols-3',
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

/** Horizontal snap rail used on the home page and product detail. */
export function ProductRail({ products }: { products: CardProduct[] }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {products.map((p, i) => (
        <div key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-auto">
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}
