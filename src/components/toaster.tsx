'use client';

import { useEffect } from 'react';
import { Check, X, Info, AlertCircle } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';
import { cn } from '@/lib/utils';

const ICONS = { success: Check, error: AlertCircle, info: Info };

export function Toaster() {
  const { toasts, dismiss } = useUI();

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex animate-pop items-center gap-3 border px-4 py-3 shadow-lift backdrop-blur',
              t.tone === 'error' ? 'border-wine/30 bg-white text-wine' : 'border-line bg-white text-ink',
            )}
          >
            <Icon size={15} strokeWidth={1.8} className={t.tone === 'error' ? 'text-wine' : 'text-gold'} />
            <span className="flex-1 text-[13px] leading-snug">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-3 hover:text-ink">
              <X size={14} strokeWidth={1.6} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Pulls the server-side wishlist once on mount for signed-in users and merges
 * anything saved locally while they were logged out.
 */
export function WishlistSync({ signedIn }: { signedIn: boolean }) {
  const ids = useWishlist((s) => s.ids);
  const hydrateFrom = useWishlist((s) => s.hydrateFrom);
  const hydrated = useWishlist((s) => s.hydrated);

  useEffect(() => {
    if (!signedIn || hydrated) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) return;
        const data = await res.json();
        const serverIds: string[] = data.ids ?? [];
        const localOnly = ids.filter((id) => !serverIds.includes(id));

        await Promise.all(
          localOnly.map((productId) =>
            fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            }).catch(() => {}),
          ),
        );

        if (!cancelled) hydrateFrom([...new Set([...serverIds, ...localOnly])]);
      } catch {
        /* offline or logged out — local list stands */
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally runs once per sign-in state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, hydrated]);

  return null;
}
