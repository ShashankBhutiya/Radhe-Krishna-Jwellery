'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Toast = { id: number; message: string; tone: 'success' | 'error' | 'info' };

type UIState = {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  toast: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
};

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toasts: [],

  openCart: () => set({ cartOpen: true, menuOpen: false, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, menuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen, cartOpen: false })),
  closeMenu: () => set({ menuOpen: false }),

  toast: (message, tone = 'success') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Last-viewed product ids, newest first, capped at 12. */
type RecentState = {
  ids: string[];
  push: (id: string) => void;
};

export const useRecent = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 12) })),
    }),
    { name: 'rk-recent' },
  ),
);
