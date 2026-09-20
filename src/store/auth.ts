'use client';

import { create } from 'zustand';

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
};

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user, hydrated: true }),
}));
