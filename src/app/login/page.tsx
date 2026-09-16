import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to track orders, save addresses and keep your wishlist.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const [session, sp] = await Promise.all([getSession(), searchParams]);
  if (session) redirect(sp.next || '/account');

  return <AuthForm mode="login" next={sp.next} reason={sp.reason} />;
}
