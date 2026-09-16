'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WishlistState = {
  ids: string[];
  hydrated: boolean;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  /** Replaces local ids with the server copy after a logged-in fetch. */
  hydrateFrom: (ids: string[]) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,

      toggle: (id) => {
        const has = get().ids.includes(id);
        set((s) => ({ ids: has ? s.ids.filter((x) => x !== id) : [...s.ids, id] }));
        // Fire-and-forget server sync; guests simply get a 401 we ignore.
        fetch('/api/wishlist', {
          method: has ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id }),
        }).catch(() => {});
      },

      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
      hydrateFrom: (ids) => set({ ids, hydrated: true }),
    }),
    { name: 'rk-wishlist' },
  ),
);
