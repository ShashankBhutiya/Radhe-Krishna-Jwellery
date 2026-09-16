import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AuthForm } from '@/components/auth-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create an account to track orders and keep your wishlist across devices.',
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [session, sp] = await Promise.all([getSession(), searchParams]);
  if (session) redirect(sp.next || '/account');

  return <AuthForm mode="register" next={sp.next} />;
}
