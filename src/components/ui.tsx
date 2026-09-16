'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn, inr, discountPct } from '@/lib/utils';

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('container-lux', className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'center',
  href,
  linkLabel = 'View all',
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: 'center' | 'left';
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-3 sm:mb-14',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        href && align === 'left' && 'sm:flex-row sm:items-end sm:justify-between',
      )}
    >
      <div className={cn('flex flex-col gap-3', align === 'center' && 'items-center')}>
        {eyebrow ? <span className="label">{eyebrow}</span> : null}
        <h2 className="display-lg text-balance">{title}</h2>
        {align === 'center' ? <span className="h-px w-14 bg-gold-soft" /> : null}
        {copy ? (
          <p className={cn('max-w-xl text-[15px] leading-relaxed text-ink-2 text-pretty', align === 'center' && 'mx-auto')}>
            {copy}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className="label link-underline whitespace-nowrap text-ink hover:text-gold-deep">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Price({ price, mrp, size = 'md' }: { price: number; mrp: number; size?: 'sm' | 'md' | 'lg' }) {
  const off = discountPct(price, mrp);
  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span
        className={cn(
          'font-display font-medium text-ink',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-3xl',
        )}
      >
        {inr(price)}
      </span>
      {off > 0 ? (
        <>
          <span className={cn('text-ink-3 line-through', size === 'lg' ? 'text-base' : 'text-xs')}>{inr(mrp)}</span>
          <span className={cn('font-medium text-gold-deep', size === 'lg' ? 'text-sm' : 'text-[11px]')}>
            {off}% off
          </span>
        </>
      ) : null}
    </span>
  );
}

export function Stars({ rating, count, size = 13 }: { rating: number; count?: number; size?: number }) {
  return (
    <span className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex items-center gap-[1px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            strokeWidth={1.5}
            className={cn(i <= Math.round(rating) ? 'fill-gold text-gold' : 'fill-transparent text-gold-soft')}
          />
        ))}
      </span>
      {count != null ? <span className="text-[11px] text-ink-3">({count})</span> : null}
    </span>
  );
}

export function Badge({
  children,
  tone = 'gold',
  className,
}: {
  children: React.ReactNode;
  tone?: 'gold' | 'ink' | 'wine' | 'muted';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 font-sans text-[9.5px] font-medium uppercase tracking-label',
        tone === 'gold' && 'bg-gold text-white',
        tone === 'ink' && 'bg-ink text-canvas',
        tone === 'wine' && 'bg-wine text-white',
        tone === 'muted' && 'border border-line bg-canvas-2 text-ink-2',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Empty({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-line bg-white/50 px-8 py-24 text-center">
      <span className="h-px w-12 bg-gold-soft" />
      <h3 className="display-md">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-ink-2">{copy}</p>
      {action ? (
        <Link href={action.href} className="btn-outline mt-2">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-[1.5px] border-current border-t-transparent', className)}
      aria-hidden
    />
  );
}
