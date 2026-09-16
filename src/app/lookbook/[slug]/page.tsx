import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: 'Entry not found' };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) notFound();

  const more = await prisma.post.findMany({
    where: { slug: { not: slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  return (
    <article>
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <Image src={post.cover} alt={post.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-canvas">
          <span className="label text-gold-soft">{post.tag} · {formatDate(post.publishedAt)}</span>
          <h1 className="display-lg mt-4 max-w-3xl text-balance text-canvas">{post.title}</h1>
          <span className="mt-5 h-px w-14 bg-gold" />
          <span className="mt-4 text-[11px] uppercase tracking-label text-canvas/60">{post.author}</span>
        </div>
      </div>

      <div className="container-lux py-14 lg:py-20">
        <div className="mx-auto max-w-[68ch]">
          {post.content.split('\n\n').map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? 'font-display text-[24px] font-light leading-[1.6] text-ink'
                  : 'mt-6 text-[16px] leading-[1.85] text-ink-2 text-pretty'
              }
            >
              {para}
            </p>
          ))}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
            <Link href="/lookbook" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-label text-ink-2 hover:text-gold-deep">
              <ArrowLeft size={13} strokeWidth={1.8} /> All entries
            </Link>
            <Link href="/shop" className="btn-outline btn-sm">Shop the collection</Link>
          </div>
        </div>
      </div>

      {more.length > 0 ? (
        <section className="border-t border-line bg-canvas-2">
          <div className="container-lux py-16">
            <h2 className="display-md text-center">Keep reading</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.slug} href={'/lookbook/' + p.slug} className="group">
                  <div className="relative aspect-[3/2] overflow-hidden bg-canvas-3">
                    <Image src={p.cover} alt={p.title} fill sizes="33vw" className="object-cover transition-transform duration-[1100ms] group-hover:scale-105" />
                  </div>
                  <span className="label mt-4 block">{p.tag}</span>
                  <h3 className="mt-1.5 font-display text-xl leading-snug group-hover:text-gold-deep">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
