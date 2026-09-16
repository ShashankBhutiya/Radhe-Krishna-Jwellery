import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-lux flex min-h-[62vh] flex-col items-center justify-center py-20 text-center">
      <span className="label">Error 404</span>
      <h1 className="display-xl mt-4">Nothing here.</h1>
      <span className="mt-6 h-px w-14 bg-gold-soft" />
      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-2">
        The page you were looking for has moved, sold out, or never existed. The collection, happily, is still where
        you left it.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/shop" className="btn-primary">Shop the collection</Link>
        <Link href="/" className="btn-outline">Back to home</Link>
      </div>
    </div>
  );
}
