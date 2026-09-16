import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Lookbook',
  description: 'Styling notes, craft explainers and the thinking behind each collection.',
};

export default async function LookbookPage() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: 'desc' } });
  const [lead, ...rest] = posts;

  return (
    <>
      <header className="border-b border-line bg-canvas-2">
        <div className="container-lux py-14 text-center lg:py-20">
          <span className="label">The journal</span>
          <h1 className="display-lg mt-4">The Lookbook</h1>
          <span className="mx-auto mt-5 block h-px w-14 bg-gold-soft" />
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-2">
            Styling notes, craft explainers and the thinking behind each collection.
          </p>
        </div>
      </header>

      <div className="container-lux py-14 lg:py-20">
        {lead ? (
          <Link href={'/lookbook/' + lead.slug} className="group grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[3/2] overflow-hidden bg-canvas-2 lg:aspect-[4/3]">
              <Image src={lead.cover} alt={lead.title} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-[1100ms] group-hover:scale-105" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="label">{lead.tag} · {formatDate(lead.publishedAt)}</span>
              <h2 className="display-lg mt-4 text-balance transition-colors group-hover:text-gold-deep">{lead.title}</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-[1.8] text-ink-2 text-pretty">{lead.excerpt}</p>
              <span className="mt-7 text-[11px] uppercase tracking-label text-gold-deep underline underline-offset-4">
                Read the entry
              </span>
            </div>
          </Link>
        ) : null}

        {rest.length > 0 ? (
          <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Link key={p.slug} href={'/lookbook/' + p.slug} className="group animate-rise" style={{ '--i': i } as React.CSSProperties}>
                <div className="relative aspect-[3/2] overflow-hidden bg-canvas-2">
                  <Image src={p.cover} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[1100ms] group-hover:scale-105" />
                </div>
                <span className="label mt-4 block">{p.tag} · {formatDate(p.publishedAt)}</span>
                <h3 className="mt-2 font-display text-[23px] font-normal leading-snug transition-colors group-hover:text-gold-deep">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
