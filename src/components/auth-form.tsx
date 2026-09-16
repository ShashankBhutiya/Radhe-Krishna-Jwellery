'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { useUI } from '@/store/ui';

const PERKS = [
  'Track every order from placed to delivered',
  'Save addresses for one-tap checkout',
  'Keep your wishlist across devices',
  'Early access to festive collections',
];

const REASONS: Record<string, string> = {
  'admin-only': 'That area is for store staff. Sign in with an admin account to continue.',
};

export function AuthForm({
  mode,
  next,
  reason,
}: {
  mode: 'login' | 'register';
  next?: string;
  reason?: string;
}) {
  const router = useRouter();
  const toast = useUI((s) => s.toast);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  // Demo credential shortcuts must never render on a public deployment.
  // Set NEXT_PUBLIC_SHOW_DEMO_LOGINS=1 to opt back in (e.g. a portfolio preview).
  const showDemoLogins =
    process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === '1';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, phone: form.phone, password: form.password },
        ),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      toast(isLogin ? `Welcome back, ${data.user.name.split(' ')[0]}` : 'Your account is ready');
      router.push(next || (data.user.role === 'ADMIN' ? '/admin' : '/account'));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <div className="container-lux py-14 lg:py-20">
      <div className="mx-auto grid max-w-4xl overflow-hidden border border-line bg-white lg:grid-cols-2">
        {/* Editorial panel */}
        <div className="hidden flex-col justify-between bg-ink p-10 text-canvas lg:flex">
          <div>
            <span className="font-display text-3xl font-light">Radhe Krishna</span>
            <span className="mt-1.5 flex items-center gap-2">
              <span className="h-px w-6 bg-gold" />
              <span className="text-[8.5px] uppercase tracking-[0.36em] text-gold-soft">Jewellery</span>
            </span>
          </div>

          <div>
            <h2 className="font-display text-[34px] font-light leading-tight">
              {isLogin ? 'Good to see you again.' : 'Join the atelier.'}
            </h2>
            <ul className="mt-8 space-y-3">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[13.5px] text-canvas/70">
                  <Check size={14} strokeWidth={1.8} className="mt-0.5 shrink-0 text-gold" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] uppercase tracking-label text-canvas/40">Hand-finished in Indore</p>
        </div>

        {/* Form */}
        <div className="p-8 sm:p-10">
          <span className="label">{isLogin ? 'Welcome back' : 'Get started'}</span>
          <h1 className="display-md mt-3">{isLogin ? 'Sign in' : 'Create your account'}</h1>

          {reason && REASONS[reason] ? (
            <p className="mt-6 border border-gold/40 bg-gold-pale px-4 py-3 text-[13px] text-gold-deep">
              {REASONS[reason]}
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 border border-wine/30 bg-wine/5 px-4 py-3 text-[13px] text-wine">{error}</p>
          ) : null}

          <form onSubmit={submit} className="mt-7 space-y-5">
            {!isLogin ? (
              <>
                <div>
                  <label className="field-label" htmlFor="name">Full name</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="field"
                    placeholder="Ananya Sharma"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">
                    Phone <span className="ml-1 normal-case tracking-normal text-ink-3">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="field"
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  required
                  minLength={isLogin ? undefined : 6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field pr-12"
                  placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-gold-deep"
                >
                  {show ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? <Spinner /> : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-ink-2">
            {isLogin ? 'New to Radhe Krishna?' : 'Already have an account?'}{' '}
            <Link
              href={isLogin ? '/register' : '/login'}
              className="text-gold-deep underline underline-offset-4 hover:text-ink"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>

          {isLogin && showDemoLogins ? (
            <div className="mt-8 border-t border-line pt-6">
              <span className="label-muted">Demo logins</span>
              <div className="mt-3 space-y-2 text-[12.5px] text-ink-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, email: 'ananya@example.com', password: 'demo1234' })}
                  className="block w-full border border-line px-3 py-2 text-left transition-colors hover:border-gold"
                >
                  <strong className="font-medium text-ink">Customer</strong> · ananya@example.com / demo1234
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, email: 'admin@radhekrishna.in', password: 'admin123' })}
                  className="block w-full border border-line px-3 py-2 text-left transition-colors hover:border-gold"
                >
                  <strong className="font-medium text-ink">Admin</strong> · admin@radhekrishna.in / admin123
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
