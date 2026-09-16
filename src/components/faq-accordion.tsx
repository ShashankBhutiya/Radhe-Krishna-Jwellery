'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-6 border-t border-line">
      {items.map((it, i) => (
        <div key={it.q} className="border-b border-line">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-start justify-between gap-6 py-5 text-left"
          >
            <span className="font-display text-[20px] leading-snug">{it.q}</span>
            <span className="mt-1 shrink-0 text-gold">
              {open === i ? <Minus size={16} strokeWidth={1.6} /> : <Plus size={16} strokeWidth={1.6} />}
            </span>
          </button>
          <div className={cn('grid transition-all duration-300', open === i ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]')}>
            <div className="overflow-hidden">
              <p className="max-w-[62ch] text-[15px] leading-[1.8] text-ink-2 text-pretty">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
