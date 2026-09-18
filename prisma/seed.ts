import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import images from './images.json';

const prisma = new PrismaClient();

type Pool = keyof typeof images;

/** Deterministic RNG so re-seeding produces the same catalogue. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260902);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const between = (a: number, b: number) => Math.floor(rnd() * (b - a + 1)) + a;
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const img = (pool: Pool, i: number, w = 900) =>
  `${images[pool][i % images[pool].length]}?auto=compress&cs=tinysrgb&w=${w}`;

const CATEGORIES = [
  {
    name: 'Necklace Sets', slug: 'necklace-sets', pool: 'necklace' as Pool, tagline: 'Statement necklines',
    description: 'Layered haars, chokers and rani-haar sets finished with hand-set stones and a deep antique polish.',
  },
  {
    name: 'Earrings', slug: 'earrings', pool: 'earrings' as Pool, tagline: 'Jhumkas to studs',
    description: 'From feather-light everyday studs to chandelier jhumkas that sweep the shoulder.',
  },
  {
    name: 'Bangles & Kada', slug: 'bangles-kada', pool: 'bangles' as Pool, tagline: 'Stacked or solitary',
    description: 'Meenakari bangles, temple kadas and slim seed-pearl stacks sized 2.4 through 2.10.',
  },
  {
    name: 'Bracelets', slug: 'bracelets', pool: 'bracelet' as Pool, tagline: 'The quiet luxury',
    description: 'Adjustable chain bracelets, cuffs and hathphools that read expensive without shouting.',
  },
  {
    name: 'Rings', slug: 'rings', pool: 'ring' as Pool, tagline: 'Cocktail to classic',
    description: 'Adjustable statement rings in kundan, polki and American diamond, so sizing is never a worry.',
  },
  {
    name: 'Anklets & Payal', slug: 'anklets-payal', pool: 'anklet' as Pool, tagline: 'Heirloom ankles',
    description: 'Oxidised silver payal with hand-strung ghungroo, plus dainty everyday chains.',
  },
  {
    name: 'Bridal Sets', slug: 'bridal-sets', pool: 'kundan' as Pool, tagline: 'The whole trousseau',
    description: 'Complete bridal suites with necklace, earrings, maang tikka and haath phool in one box.',
  },
  {
    name: 'Pearl & Polki', slug: 'pearl-polki', pool: 'pearl' as Pool, tagline: 'Soft, uncut lustre',
    description: 'Freshwater-look pearls strung with uncut polki for the softest possible shine.',
  },
  {
    name: 'Oxidised Silver', slug: 'oxidised-silver', pool: 'silver' as Pool, tagline: 'Tribal & temple',
    description: 'Blackened silver-finish pieces with tribal motifs, the ideal foil to cotton and linen.',
  },
  {
    name: 'Maang Tikka & Nose Pins', slug: 'maang-tikka-nose-pins', pool: 'gemstone' as Pool, tagline: 'The finishing touch',
    description: 'Matha pattis, borlas and clip-on naths that need no piercing.',
  },
];

const NAMES: Record<string, string[]> = {
  'necklace-sets': ['Rajwada Kundan Choker Set', 'Meera Layered Rani Haar', 'Anaya Emerald Drop Necklace', 'Zarina Meenakari Collar', 'Padmini Temple Haar', 'Noor Pearl Cascade Set', 'Vaidehi Polki Bib Necklace', 'Ishara Ruby Line Necklace'],
  earrings: ['Gulnaar Chandbali Jhumka', 'Sitara Pearl Drop Studs', 'Kesar Peacock Jhumka', 'Amrita Chandelier Earrings', 'Tanvi Everyday Hoops', 'Roshni Kundan Ear Cuff', 'Zoya Meenakari Jhumka', 'Anokhi Temple Studs', 'Mehr Rose Gold Danglers', 'Saanjh Oxidised Chandbali'],
  'bangles-kada': ['Chandni Meenakari Bangle Set', 'Rukmini Temple Kada', 'Payal Seed Pearl Stack', 'Gauri Polki Bangle Pair', 'Ambar Oxidised Kada', 'Nayantara Enamel Bangles'],
  bracelets: ['Sharanya Chain Bracelet', 'Devika Kundan Cuff', 'Aarohi Haath Phool', 'Kiara Tennis Bracelet', 'Mitra Oxidised Cuff', 'Elara Pearl Strand Bracelet'],
  rings: ['Rukhsar Cocktail Ring', 'Tara Solitaire Ring', 'Bela Meenakari Ring', 'Adira Polki Statement Ring', 'Naina Stackable Band Trio', 'Suhani Emerald Ring'],
  'anklets-payal': ['Ghungroo Payal Pair', 'Bindiya Chain Anklet', 'Sanchi Tribal Payal', 'Vrinda Pearl Anklet', 'Kajal Layered Anklet', 'Nupur Bell Payal'],
  'bridal-sets': ['Shubh Vivah Bridal Suite', 'Rajasi Kundan Trousseau Set', 'Lavanya Polki Bridal Set', 'Mangal Temple Bridal Suite', 'Sindoor Red Meenakari Set', 'Swarnima Grand Bridal Set'],
  'pearl-polki': ['Motiya Pearl Layer Set', 'Chandrika Polki Pendant', 'Sadaf Baroque Pearl Set', 'Husn Polki Drop Earrings', 'Sheen Pearl Choker', 'Rehana Polki Line Set'],
  'oxidised-silver': ['Banjara Tribal Necklace', 'Kutch Mirror Jhumka', 'Bastar Coin Haar', 'Adivasi Cuff Kada', 'Warli Motif Studs', 'Jaisalmer Layered Set'],
  'maang-tikka-nose-pins': ['Borla Rajputi Maang Tikka', 'Matha Patti Grand', 'Sitara Clip-On Nath', 'Pichwai Kundan Tikka', 'Halka Pearl Tikka', 'Chameli Nose Ring'],
};

const MATERIALS = ['Kundan', 'Polki', 'Temple / Antique', 'Oxidised Silver', 'Gold Plated', 'Rose Gold', 'American Diamond', 'Pearl', 'Meenakari'];
const COLORS = ['Gold', 'Silver', 'Rose Gold', 'Multi', 'Green', 'Red', 'White'];
const OCCASIONS = ['Bridal', 'Festive', 'Party', 'Daily Wear', 'Office', 'Gifting'];

const DESC_OPEN = [
  'Struck from a brass alloy and finished by hand in our Indore workshop,',
  'Built on a solid brass base with a triple-dipped micron plating,',
  'Hand-set stone by stone over three days by a single karigar,',
  'Cast from a mould originally carved for a temple commission,',
];
const DESC_MID = [
  'the piece carries the honest weight of real jewellery, with nothing hollow and nothing tinny.',
  'it holds its lustre through a full wedding season with only a soft-cloth wipe.',
  'every stone sits in a closed-back setting so nothing snags on silk or chiffon.',
  'the finish is deliberately warm rather than brassy, so it flatters Indian skin tones.',
];
const DESC_END = [
  'Nickel-free and lead-free, safe for sensitive skin.',
  'Arrives in a lined keepsake box with an anti-tarnish pouch.',
  'Comes with a six-month plating warranty against normal wear.',
  'Adjustable fitting, so it works across body types without alteration.',
];

const REVIEW_TITLES = [
  'Looks far costlier than it is',
  'Perfect for my wedding functions',
  'Exactly like the photos',
  'Got compliments all evening',
  'Beautiful weight and finish',
  'Repeat customer, never disappointed',
  'Great value for the price',
  'Lovely, but do check the size',
];
const REVIEW_BODIES = [
  'Wore this to a reception and three people asked where it was from. The weight is what sells it, it does not feel like costume jewellery at all.',
  'The gold tone is warm rather than orange, which is exactly what I wanted. Packaging was lovely too, it felt like opening something expensive.',
  'Shipped in four days. Colour matches the listing photos precisely, which almost never happens when I order jewellery online.',
  'My mother borrowed it the day it arrived and has not given it back. Buying a second one.',
  'Very comfortable for a long function. The earrings have good back support so my ears did not hurt after six hours.',
  'Four stars only because it runs slightly larger than I expected. The quality itself is excellent for this price.',
  'Paired it with a plain silk saree and it completely carried the look. I will be back before Diwali.',
];
const REVIEWERS = ['Ananya S.', 'Priya Menon', 'Ritu Agarwal', 'Sneha K.', 'Divya Raghavan', 'Meghna B.', 'Kavya Nair', 'Farah Q.', 'Neha Sharma', 'Pooja Iyer', 'Aarti Deshmukh', 'Shreya M.'];

async function main() {
  // Seeding wipes the catalogue. On a database that already holds real orders
  // that would be destructive, so require an explicit opt-in.
  const existingOrders = await prisma.order.count().catch(() => 0);
  if (existingOrders > 0 && process.env.FORCE_SEED !== '1') {
    console.error(
      [
        '',
        `Refusing to seed: this database already has ${existingOrders} order(s).`,
        'Seeding deletes all catalogue and order data.',
        'Re-run with FORCE_SEED=1 if you are certain.',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.post.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.contactMessage.deleteMany();

  console.log('Seeding users...');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@radhekrishna.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const demoPassword = process.env.DEMO_PASSWORD || 'demo1234';

  await prisma.user.create({
    data: {
      name: 'Store Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
      phone: '+91 99930 07021',
    },
  });
  const customer = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      passwordHash: await bcrypt.hash(demoPassword, 10),
      role: 'CUSTOMER',
      phone: '+91 91234 56780',
      addresses: {
        create: [
          {
            label: 'Home', name: 'Ananya Sharma', phone: '+91 91234 56780',
            line1: 'B-402, Sunrise Residency', line2: 'Vasant Kunj',
            city: 'New Delhi', state: 'Delhi', pincode: '110070', isDefault: true,
          },
        ],
      },
    },
  });

  console.log('Seeding categories and products...');
  let imgCursor = 0;
  let productCount = 0;

  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    const c = CATEGORIES[ci];
    const cat = await prisma.category.create({
      data: {
        name: c.name, slug: c.slug, tagline: c.tagline, description: c.description,
        image: img(c.pool, ci * 3 + 1, 1200), sortOrder: ci,
      },
    });

    const names = NAMES[c.slug];
    for (let pi = 0; pi < names.length; pi++) {
      const name = names[pi];
      const price = Math.min(between(6, 78) * 50 + 449, 9999);
      const mrp = Math.round((price * (1 + between(25, 70) / 100)) / 10) * 10;
      const material = pick(MATERIALS);
      const occasion = pick(OCCASIONS);

      const product = await prisma.product.create({
        data: {
          name,
          slug: slugify(name),
          sku: `RK-${c.slug.slice(0, 3).toUpperCase()}-${String(1000 + productCount)}`,
          shortDesc: `${material} ${c.name.replace(/s$/, '').toLowerCase()} finished for ${occasion.toLowerCase()} wear.`,
          description: `${pick(DESC_OPEN)} ${pick(DESC_MID)} ${pick(DESC_END)}`,
          price,
          mrp,
          stock: rnd() > 0.9 ? 0 : between(3, 40),
          categoryId: cat.id,
          material,
          occasion,
          color: pick(COLORS),
          weightGrams: between(12, 120),
          isFeatured: rnd() > 0.72,
          isNew: rnd() > 0.7,
          isBestseller: rnd() > 0.74,
          images: {
            create: [0, 1, 2].map((k) => ({
              url: img(c.pool, imgCursor + k, 1000),
              alt: `${name} view ${k + 1}`,
              sortOrder: k,
            })),
          },
        },
      });
      imgCursor += 3;
      productCount++;

      const nReviews = between(0, 6);
      for (let r = 0; r < nReviews; r++) {
        await prisma.review.create({
          data: {
            productId: product.id,
            userId: r === 0 && rnd() > 0.6 ? customer.id : null,
            authorName: pick(REVIEWERS),
            rating: rnd() > 0.22 ? 5 : rnd() > 0.4 ? 4 : 3,
            title: pick(REVIEW_TITLES),
            body: pick(REVIEW_BODIES),
            createdAt: new Date(Date.now() - between(1, 260) * 86400000),
          },
        });
      }
    }
  }

  console.log('Seeding coupons...');
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', type: 'PERCENT', value: 10, minOrder: 999, maxDiscount: 500, description: '10% off your first order above 999', active: true },
      { code: 'FESTIVE500', type: 'FLAT', value: 500, minOrder: 2999, description: 'Flat 500 off orders above 2,999', active: true },
      { code: 'BRIDAL15', type: 'PERCENT', value: 15, minOrder: 4999, maxDiscount: 1500, description: '15% off bridal orders above 4,999', active: true },
      { code: 'FREESHIP', type: 'FLAT', value: 79, minOrder: 0, description: 'Free shipping on any order', active: true },
    ],
  });

  console.log('Seeding lookbook...');
  const posts = [
    { title: 'How to Layer a Rani Haar Without Overwhelming the Neckline', tag: 'Styling', excerpt: 'Three lengths, one rule: let each piece finish before the next begins.', pool: 'necklace' as Pool },
    { title: 'Kundan, Polki and Jadau, and What Actually Separates Them', tag: 'Craft', excerpt: 'They look related because they are. Here is how to tell them apart at a glance.', pool: 'kundan' as Pool },
    { title: 'The Six-Piece Bridal Edit Every Trousseau Needs', tag: 'Bridal', excerpt: 'What to buy first, what to borrow, and what you will genuinely wear again.', pool: 'kundan' as Pool },
    { title: 'Caring for Oxidised Silver So It Ages Well, Not Badly', tag: 'Care', excerpt: 'Oxidised finishes are meant to deepen. Here is how to help them do it gracefully.', pool: 'silver' as Pool },
    { title: 'Office-Appropriate Jhumkas: Yes, They Exist', tag: 'Styling', excerpt: 'Scale down the drop, keep the craft. Five pairs that pass the boardroom test.', pool: 'earrings' as Pool },
    { title: 'Why Weight Is the Truest Test of Imitation Jewellery', tag: 'Craft', excerpt: 'Hollow pieces announce themselves. Solid brass never does.', pool: 'bangles' as Pool },
  ];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    await prisma.post.create({
      data: {
        title: p.title,
        slug: slugify(p.title),
        excerpt: p.excerpt,
        tag: p.tag,
        cover: img(p.pool, 20 + i * 2, 1400),
        publishedAt: new Date(Date.now() - i * 9 * 86400000),
        content: [
          p.excerpt,
          'There is a long-standing assumption that imitation jewellery is a compromise, something you wear when the real thing is locked in a bank vault. We have never believed that. The craft that goes into a hand-set kundan choker is identical whether the stone behind the foil is a diamond or a carefully cut zircon.',
          'What changes is the material cost. Not the labour, not the design, and not the way it sits against the collarbone.',
          'Start with proportion. A piece should end where your outfit begins: a choker above a high neck, a rani haar below a deep one. When the two compete, the eye reads clutter rather than intent.',
          'Then consider finish. A warm antique gold flatters most Indian skin tones far better than a bright yellow plating, which photographs sharp and cold under indoor lighting.',
          'Finally, wear it more than once. The pieces worth owning are the ones that leave the box for reasons other than a wedding invitation.',
        ].join('\n\n'),
      },
    });
  }

  console.log('Seeding a sample order...');
  const someProducts = await prisma.product.findMany({ take: 3, include: { images: true } });
  const subtotal = someProducts.reduce((s, p) => s + p.price, 0);
  await prisma.order.create({
    data: {
      orderNumber: 'RK26-K7X2M',
      userId: customer.id,
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone as string,
      addressLine1: 'B-402, Sunrise Residency',
      addressLine2: 'Vasant Kunj',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
      subtotal,
      discount: 0,
      shipping: 0,
      total: subtotal,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 6 * 86400000),
      items: {
        create: someProducts.map((p) => ({
          productId: p.id,
          name: p.name,
          slug: p.slug,
          image: p.images[0]?.url ?? '',
          price: p.price,
          qty: 1,
        })),
      },
    },
  });

  await prisma.contactMessage.create({
    data: {
      name: 'Rhea Kapoor',
      email: 'rhea@example.com',
      phone: '+91 99887 76655',
      subject: 'Bulk order for wedding favours',
      message: 'Hello! I am looking for 40 matching bangle sets as return gifts for a wedding in November. Do you offer bulk pricing?',
    },
  });

  const [cats, prods, revs] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.review.count(),
  ]);
  console.log(`\nDone. ${cats} categories, ${prods} products, ${revs} reviews.`);
  console.log(`Admin login    : ${adminEmail}`);
  console.log('Customer login : ananya@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
