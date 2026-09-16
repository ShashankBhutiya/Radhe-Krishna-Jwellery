'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { useUI } from '@/store/ui';
import { cn, inr } from '@/lib/utils';

type Hit = { id: string; name: string; slug: string; price: number; image: string | null; category: string };

const SUGGESTIONS = ['Kundan choker', 'Jhumka', 'Bridal set', 'Oxidised silver', 'Pearl necklace', 'Maang tikka'];

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = '';
      setQ('');
      setHits([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSearch();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  // Debounced type-ahead against the products API.
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setHits(data.hits ?? []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    closeSearch();
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div className={cn('fixed inset-0 z-50', searchOpen ? 'visible' : 'invisible')} aria-hidden={!searchOpen}>
      <div
        className={cn('absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300', searchOpen ? 'opacity-100' : 'opacity-0')}
        onClick={closeSearch}
      />

      <div
        className={cn(
          'absolute inset-x-0 top-0 bg-canvas transition-transform duration-400 ease-out',
          searchOpen ? 'translate-y-0' : '-translate-y-full',
        )}
      >
        <div className="container-lux py-8">
          <div className="flex items-center justify-between">
            <span className="label">Search the collection</span>
            <button type="button" onClick={closeSearch} aria-label="Close search" className="text-ink hover:text-gold-deep">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 flex items-center gap-4 border-b border-ink/20 pb-4 focus-within:border-gold">
            <Search size={22} strokeWidth={1.3} className="shrink-0 text-gold" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “kundan choker” or “jhumka”"
              className="w-full bg-transparent font-display text-2xl font-light placeholder:text-ink-3/60 focus:outline-none sm:text-4xl"
            />
            {q ? (
              <button type="submit" aria-label="Search" className="shrink-0 text-ink-2 hover:text-gold-deep">
                <ArrowRight size={22} strokeWidth={1.4} />
              </button>
            ) : null}
          </form>

          <div className="max-h-[54vh] overflow-y-auto py-6">
            {q.trim().length < 2 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-muted mr-2">Popular</span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQ(s)}
                    className="border border-line px-3.5 py-2 text-xs text-ink-2 transition-colors hover:border-gold hover:text-gold-deep"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="skeleton h-20 w-16" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="skeleton h-3 w-3/4" />
                      <div className="skeleton h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hits.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-2">
                Nothing matched “{q}”. Try a category, material or occasion instead.
              </p>
            ) : (
              <>
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {hits.map((h) => (
                    <Link
                      key={h.id}
                      href={`/product/${h.slug}`}
                      onClick={closeSearch}
                      className="group flex items-center gap-4 border-b border-line/60 pb-4"
                    >
                      <div className="relative h-[76px] w-[62px] shrink-0 overflow-hidden bg-canvas-2">
                        {h.image ? <Image src={h.image} alt={h.name} fill sizes="62px" className="object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <span className="label-muted block">{h.category}</span>
                        <span className="block truncate font-display text-lg group-hover:text-gold-deep">{h.name}</span>
                        <span className="text-sm text-ink-2">{inr(h.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <button onClick={() => submit()} className="btn-outline btn-sm mt-7">
                  See all results for “{q}”
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
