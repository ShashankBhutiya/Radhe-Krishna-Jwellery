import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { NewsletterForm } from '@/components/site-footer';
import { SectionHeading } from '@/components/ui';
import { OCCASIONS } from '@/lib/site';

type Cat = { name: string; slug: string; tagline: string | null; image: string | null; _count?: { products: number } };

export function Hero({ image, secondary }: { image: string; secondary: string }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      <div className="container-lux grid items-center gap-10 py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-24">
        <div className="animate-rise">
          <span className="label flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            Est. Indore · Hand-finished
          </span>

          <h1 className="display-xl mt-6 text-balance">
            Jewellery that
            <span className="block italic text-gold-deep">carries weight.</span>
          </h1>

          <p className="mt-7 max-w-md text-[15.5px] leading-[1.75] text-ink-2 text-pretty">
            Kundan, polki and temple work set stone by stone on solid brass, finished in a warm antique gold.
            Everything you expect from fine jewellery, at a price that lets you own the whole set.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/shop" className="btn-primary group w-full sm:w-auto">
              Shop the collection
              <ArrowRight size={14} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/shop?occasion=Bridal" className="btn-outline w-full sm:w-auto">
              The bridal edit
            </Link>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              { k: '66+', v: 'Pieces in stock' },
              { k: '4.8/5', v: 'Average rating' },
              { k: '6 mo', v: 'Plating warranty' },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl font-light text-ink">{s.k}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-wider2 text-ink-3">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-fade">
          <div className="frame-gold relative aspect-[4/5] overflow-hidden lg:aspect-[5/6]">
            <Image
              src={image}
              alt="Hand-finished kundan jewellery"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>

          {/* Offset secondary image, desktop only. */}
          <div className="absolute -bottom-8 -left-10 hidden aspect-square w-52 overflow-hidden border-[6px] border-canvas shadow-lift xl:block">
            <Image src={secondary} alt="" fill sizes="208px" className="object-cover" />
          </div>

          <div className="absolute -right-4 top-8 hidden bg-canvas px-5 py-4 shadow-soft xl:block">
            <span className="label block text-gold-deep">Free shipping</span>
            <span className="mt-1 block font-display text-xl">On orders over ₹999</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryStrip({ categories }: { categories: Cat[] }) {
  return (
    <section className="container-lux py-20 lg:py-28">
      <SectionHeading
        eyebrow="Browse the atelier"
        title="Shop by category"
        copy="Ten collections, each finished by hand in the same Indore workshop."
      />

      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:px-0">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group w-[54vw] shrink-0 snap-start animate-rise sm:w-[34vw] md:w-[26vw] lg:w-auto"
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-canvas-2">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-canvas">
                <h3 className="font-display text-[21px] font-normal leading-tight">{c.name}</h3>
                <span className="mt-0.5 block text-[10.5px] uppercase tracking-wider2 text-canvas/70">
                  {c._count?.products ?? 0} pieces
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function EditorialSplit({ image }: { image: string }) {
  return (
    <section className="border-y border-line bg-canvas-2">
      <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-[4/5]">
          <Image src={image} alt="Inside the workshop" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
        </div>

        <div>
          <span className="label flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            The difference
          </span>
          <h2 className="display-lg mt-5 text-balance">
            Hollow pieces announce themselves. <em className="text-gold-deep">Ours never do.</em>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.8] text-ink-2 text-pretty">
            Most imitation jewellery is stamped from thin sheet, which is why it feels weightless and bends within a
            season. We build on a solid brass base, then triple-dip the plating so the colour survives real wear.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-ink-2 text-pretty">
            The stones are set in closed-back mounts by a single karigar rather than glued in a line. It takes three
            days longer per piece. You can feel the difference the moment you pick it up.
          </p>

          <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              'Solid brass base, never hollow',
              'Triple-dipped micron plating',
              'Hand-set closed-back stones',
              'Nickel-free, lead-free, skin safe',
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-ink-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/about" className="btn-outline mt-10">
            Read our story
          </Link>
        </div>
      </div>
    </section>
  );
}

export function OccasionTiles({ images }: { images: string[] }) {
  return (
    <section className="container-lux py-20 lg:py-28">
      <SectionHeading eyebrow="Dressed for the day" title="Shop by occasion" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
        {OCCASIONS.map((o, i) => (
          <Link
            key={o}
            href={`/shop?occasion=${encodeURIComponent(o)}`}
            className="group relative aspect-[16/10] overflow-hidden animate-rise"
            style={{ '--i': i } as React.CSSProperties}
          >
            {images[i] ? (
              <Image
                src={images[i]}
                alt={o}
                fill
                sizes="(max-width:1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1100ms] group-hover:scale-110"
              />
            ) : null}
            <div className="absolute inset-0 bg-ink/45 transition-colors duration-500 group-hover:bg-ink/25" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="border border-canvas/40 px-6 py-3 font-display text-xl text-canvas backdrop-blur-[2px] transition-all duration-500 group-hover:border-gold group-hover:bg-gold/90 sm:text-2xl">
                {o}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'I ordered the bridal suite for my sister three weeks before the wedding and genuinely could not tell it apart from the real set in the photographs.',
    name: 'Kavya Nair',
    place: 'Kochi',
  },
  {
    quote:
      'The weight is what convinced me. It sits on the collarbone the way heavy jewellery does, not the way costume pieces float.',
    name: 'Ritu Agarwal',
    place: 'Lucknow',
  },
  {
    quote:
      'Third order this year. The oxidised pieces have darkened beautifully rather than flaking, which is exactly what I was told would happen.',
    name: 'Meghna Bose',
    place: 'Kolkata',
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-line bg-ink py-20 text-canvas lg:py-28">
      <div className="container-lux">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="label text-gold-soft">Worn and reviewed</span>
          <h2 className="display-lg text-canvas">From our customers</h2>
          <span className="h-px w-14 bg-gold" />
        </div>

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-14">
          {TESTIMONIALS.map((t, i) => (
            <figure key={t.name} className="flex flex-col items-center text-center animate-rise" style={{ '--i': i } as React.CSSProperties}>
              <Quote size={22} strokeWidth={1.2} className="text-gold" />
              <blockquote className="mt-5 font-display text-[21px] font-light leading-[1.55] text-canvas/90 text-pretty">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6">
                <span className="block text-[11px] uppercase tracking-label text-gold-soft">{t.name}</span>
                <span className="mt-1 block text-[11px] text-canvas/45">{t.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LookbookTeaser({
  posts,
}: {
  posts: { title: string; slug: string; excerpt: string; cover: string; tag: string }[];
}) {
  if (!posts.length) return null;

  return (
    <section className="container-lux py-20 lg:py-28">
      <SectionHeading
        eyebrow="The lookbook"
        title="Styling notes & craft"
        align="left"
        href="/lookbook"
        linkLabel="All journal entries"
      />

      <div className="grid gap-8 md:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => (
          <Link key={p.slug} href={`/lookbook/${p.slug}`} className="group animate-rise" style={{ '--i': i } as React.CSSProperties}>
            <div className="relative aspect-[3/2] overflow-hidden bg-canvas-2">
              <Image
                src={p.cover}
                alt={p.title}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[1100ms] group-hover:scale-105"
              />
            </div>
            <span className="label mt-4 block">{p.tag}</span>
            <h3 className="mt-2 font-display text-[22px] font-normal leading-snug transition-colors group-hover:text-gold-deep">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="border-y border-line bg-canvas-2">
      <div className="container-lux flex flex-col items-center gap-6 py-20 text-center lg:py-24">
        <span className="label">Ten percent, on us</span>
        <h2 className="display-lg max-w-2xl text-balance">
          Join the atelier letter and take <em className="text-gold-deep">10% off</em> your first order
        </h2>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-2">
          New collections, styling notes and early access to festive drops. Twice a month at most, never more.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
