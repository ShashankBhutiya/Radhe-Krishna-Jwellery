import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TrustBar } from '@/components/site-footer';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our story',
  description: 'How Radhe Krishna Jewellery makes imitation jewellery that carries the weight of the real thing.',
};

export default async function AboutPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, take: 9 });
  const img = (i: number) => categories[i]?.image ?? categories[0]?.image ?? '';

  return (
    <>
      <header className="relative">
        <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
          {img(6) ? <Image src={img(6)} alt="Inside the workshop" fill priority sizes="100vw" className="object-cover" /> : null}
          <div className="absolute inset-0 bg-ink/58" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-canvas">
            <span className="label text-gold-soft">Hand-finished in {SITE.address.city}</span>
            <h1 className="display-xl mt-4 max-w-4xl text-balance text-canvas">
              We make the jewellery <em className="text-gold-soft">we could not find.</em>
            </h1>
          </div>
        </div>
      </header>

      <section className="container-lux py-20 lg:py-28">
        <div className="mx-auto max-w-[68ch]">
          <p className="font-display text-[25px] font-light leading-[1.6]">
            Imitation jewellery in India has a reputation problem, and most of it is deserved. Thin stamped sheet,
            glued stones, a plating that goes green by the second wedding.
          </p>
          <p className="mt-7 text-[16px] leading-[1.85] text-ink-2 text-pretty">
            We started because we knew it did not have to be that way. The karigars who set stones for fine
            jewellery use exactly the same technique whether the stone is a diamond or a zircon. The skill does
            not change with the material. Only the price does.
          </p>
          <p className="mt-5 text-[16px] leading-[1.85] text-ink-2 text-pretty">
            So we build on solid brass rather than hollow sheet, triple-dip the plating rather than flash it once,
            and set every stone in a closed-back mount by hand. A necklace takes three days longer than the market
            standard. It also survives a wedding season, and the one after that.
          </p>
          <p className="mt-5 text-[16px] leading-[1.85] text-ink-2 text-pretty">
            Everything on this site is made by the same team, in the same workshop. If a piece ever fails within
            six months of normal wear, we replace it. That has always been the deal.
          </p>
        </div>
      </section>

      <TrustBar />

      <section className="border-y border-line bg-canvas-2 py-20 lg:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="grid grid-cols-2 gap-4">
            {[1, 3, 5, 8].map((n, i) => (
              <div key={n} className={'relative aspect-[4/5] overflow-hidden bg-canvas-3 ' + (i % 2 ? 'mt-8' : '')}>
                {img(n) ? <Image src={img(n)} alt="" fill sizes="25vw" className="object-cover" /> : null}
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-center">
            <span className="label">What we promise</span>
            <h2 className="display-lg mt-4 text-balance">Four things, in writing.</h2>

            <dl className="mt-9 space-y-7">
              {[
                ['Solid, never hollow', 'Every base is cast brass with real heft. If it feels light in the hand, it is not ours.'],
                ['Six-month warranty', 'Plating loss under normal wear is replaced free, no argument, no proof of purchase drama.'],
                ['Skin-safe always', 'Nickel-free and lead-free across the entire catalogue, not just a "sensitive" range.'],
                ['Honest photography', 'Shot under neutral light with no colour grading. What arrives is what you saw.'],
              ].map(([t, c]) => (
                <div key={t} className="border-l-2 border-gold pl-5">
                  <dt className="font-display text-[21px]">{t}</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{c}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">Shop the collection</Link>
              <Link href="/contact" className="btn-outline">Visit the workshop</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-lux py-20 text-center lg:py-28">
        <span className="label">Come and see</span>
        <h2 className="display-lg mt-4">{SITE.address.city}, {SITE.address.state}</h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-2">
          Open {SITE.hours}. Call{' '}
          <a href={SITE.phoneHref} className="text-gold-deep underline underline-offset-4">{SITE.phone}</a>{' '}
          and we will share directions before you visit.
        </p>
        <Link href="/contact" className="btn-outline mt-8">Get in touch</Link>
      </section>
    </>
  );
}
