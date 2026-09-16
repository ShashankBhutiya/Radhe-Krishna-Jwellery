'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATERIALS, COLORS, OCCASIONS, PRICE_BANDS, SORTS } from '@/lib/site';

type Group = { key: string; title: string; options: readonly string[] };

const GROUPS: Group[] = [
  { key: 'material', title: 'Material', options: MATERIALS },
  { key: 'occasion', title: 'Occasion', options: OCCASIONS },
  { key: 'colour', title: 'Colour', options: COLORS },
];

/** Reads/writes multi-value filters as repeated query params. */
function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const values = useCallback((key: string) => params.getAll(key), [params]);

  const apply = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete('page'); // any filter change resets pagination
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      apply((p) => {
        const current = p.getAll(key);
        p.delete(key);
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        next.forEach((v) => p.append(key, v));
      });
    },
    [apply],
  );

  const setSingle = useCallback(
    (key: string, value: string | null) => {
      apply((p) => {
        p.delete(key);
        if (value) p.set(key, value);
      });
    },
    [apply],
  );

  const clearAll = useCallback(() => {
    apply((p) => {
      ['material', 'occasion', 'colour', 'band', 'stock'].forEach((k) => p.delete(k));
    });
  }, [apply]);

  return { params, values, toggle, setSingle, clearAll };
}

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-[5px] text-[13.5px] text-ink-2 transition-colors hover:text-ink">
      <span
        className={cn(
          'grid h-[15px] w-[15px] shrink-0 place-items-center border transition-colors',
          checked ? 'border-gold bg-gold text-white' : 'border-line bg-white group-hover:border-gold',
        )}
      >
        {checked ? <Check size={10} strokeWidth={3} /> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function FilterAccordion({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="label text-ink">{title}</span>
        <ChevronDown size={15} strokeWidth={1.6} className={cn('text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', open ? 'mt-3 max-h-96' : 'max-h-0')}>{children}</div>
    </div>
  );
}

export function FilterPanel() {
  const { values, toggle, setSingle, clearAll } = useFilterParams();
  const band = values('band')[0] ?? '';
  const inStock = values('stock')[0] === 'in';

  const activeCount =
    GROUPS.reduce((n, g) => n + values(g.key).length, 0) + (band ? 1 : 0) + (inStock ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink/15 pb-4">
        <span className="font-display text-xl">Filter</span>
        {activeCount > 0 ? (
          <button type="button" onClick={clearAll} className="text-[11px] uppercase tracking-label text-gold-deep hover:text-ink">
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>

      <FilterAccordion title="Price">
        <div className="flex flex-col">
          {PRICE_BANDS.map((b) => (
            <Checkbox
              key={b.label}
              label={b.label}
              checked={band === b.label}
              onChange={() => setSingle('band', band === b.label ? null : b.label)}
            />
          ))}
        </div>
      </FilterAccordion>

      {GROUPS.map((g) => (
        <FilterAccordion key={g.key} title={g.title} defaultOpen={g.key !== 'colour'}>
          <div className="flex flex-col">
            {g.options.map((o) => (
              <Checkbox key={o} label={o} checked={values(g.key).includes(o)} onChange={() => toggle(g.key, o)} />
            ))}
          </div>
        </FilterAccordion>
      ))}

      <FilterAccordion title="Availability">
        <Checkbox label="In stock only" checked={inStock} onChange={() => setSingle('stock', inStock ? null : 'in')} />
      </FilterAccordion>
    </div>
  );
}

export function SortBar({ total, showing }: { total: number; showing: number }) {
  const { params, setSingle } = useFilterParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sort = params.get('sort') ?? 'featured';

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[12.5px] text-ink-2">
          Showing <span className="text-ink">{showing}</span> of <span className="text-ink">{total}</span> pieces
        </p>

        {/* Filter and sort share the row evenly until there is space to shrink them. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 border border-line px-4 py-2.5 text-[11px] uppercase tracking-label text-ink transition-colors hover:border-gold sm:flex-none lg:hidden"
          >
            <SlidersHorizontal size={13} strokeWidth={1.6} />
            Filter
          </button>

          <label className="flex flex-1 items-center gap-2 sm:flex-none">
            <span className="hidden text-[11px] uppercase tracking-label text-ink-3 sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSingle('sort', e.target.value)}
              className="w-full min-w-0 cursor-pointer border border-line bg-white px-3 py-2.5 text-[12.5px] text-ink focus:border-gold focus:outline-none sm:w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', drawerOpen ? 'visible' : 'invisible')} aria-hidden={!drawerOpen}>
        <div
          className={cn('absolute inset-0 bg-ink/45 backdrop-blur-sm transition-opacity', drawerOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-canvas p-6 transition-transform duration-400 ease-out',
            drawerOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="text-ink hover:text-gold-deep">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <FilterPanel />
          <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary mt-6 w-full">
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

export function ActiveChips() {
  const { params, toggle, setSingle, clearAll } = useFilterParams();

  const chips: { label: string; onRemove: () => void }[] = [];
  GROUPS.forEach((g) => params.getAll(g.key).forEach((v) => chips.push({ label: v, onRemove: () => toggle(g.key, v) })));
  const band = params.get('band');
  if (band) chips.push({ label: band, onRemove: () => setSingle('band', null) });
  if (params.get('stock') === 'in') chips.push({ label: 'In stock', onRemove: () => setSingle('stock', null) });
  const q = params.get('q');
  if (q) chips.push({ label: `“${q}”`, onRemove: () => setSingle('q', null) });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.onRemove}
          className="flex items-center gap-2 border border-line bg-white px-3 py-1.5 text-[11.5px] text-ink-2 transition-colors hover:border-gold hover:text-ink"
        >
          {c.label}
          <X size={11} strokeWidth={2} />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="ml-1 text-[11px] uppercase tracking-label text-gold-deep hover:text-ink">
        Clear
      </button>
    </div>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const params = useSearchParams();
  const pathname = usePathname();

  if (pages <= 1) return null;

  const href = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(p));
    return `${pathname}?${next.toString()}`;
  };

  // Compact window around the current page.
  const nums: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }

  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="border border-line px-4 py-2.5 text-[11px] uppercase tracking-label hover:border-gold hover:text-gold-deep">
          Prev
        </Link>
      ) : null}

      {nums.map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-3">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? 'page' : undefined}
            className={cn(
              'grid h-10 w-10 place-items-center border text-[13px] transition-colors',
              n === page ? 'border-ink bg-ink text-canvas' : 'border-line hover:border-gold hover:text-gold-deep',
            )}
          >
            {n}
          </Link>
        ),
      )}

      {page < pages ? (
        <Link href={href(page + 1)} className="border border-line px-4 py-2.5 text-[11px] uppercase tracking-label hover:border-gold hover:text-gold-deep">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
