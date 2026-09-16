'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp: number;
  qty: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  savings: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            const next = Math.min(existing.qty + qty, Math.max(item.stock, 1));
            return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: next } : i)) };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),

      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, Math.max(i.stock, 1)) } : i)),
        })),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
      savings: () => get().items.reduce((n, i) => n + Math.max(0, i.mrp - i.price) * i.qty, 0),
    }),
    { name: 'rk-cart' },
  ),
);
