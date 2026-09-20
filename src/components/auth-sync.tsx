'use client';

import { useEffect } from 'react';
import { useAuth, type AuthUser } from '@/store/auth';

export function AuthSync({ user }: { user: AuthUser | null }) {
  const setUser = useAuth((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}
