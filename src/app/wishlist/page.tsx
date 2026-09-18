import type { Metadata } from 'next';
import { WishlistView } from '@/components/wishlist-view';

export const metadata: Metadata = {
  title: 'Your wishlist',
  description: 'The pieces you have saved for later.',
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-12 text-center lg:py-16">
          <span className="label">Saved for later</span>
          <h1 className="display-lg mt-3">Your wishlist</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-2">
            Signed in, your wishlist follows you across devices.
          </p>
        </div>
      </header>

      <div className="container-lux py-12 lg:py-16">
        <WishlistView />
      </div>
    </>
  );
}
