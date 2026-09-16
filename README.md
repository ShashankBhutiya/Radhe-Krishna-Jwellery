# Radhe Krishna Jewellery

A full-featured e-commerce storefront for imitation jewellery — Next.js 15 (App Router), TypeScript, Tailwind, Prisma + Postgres.

**Live:** https://radhe-krishna-jewellery.vercel.app

Ivory-and-antique-gold editorial design, ₹ INR pricing, COD + simulated online payment.

---

## Getting started

```bash
npm install
cp .env.example .env    # fill in DATABASE_URL and AUTH_SECRET
npm run setup
npm run dev
```

`npm run setup` generates the Prisma client, pushes the schema, and seeds 10 categories, 66 products, ~185 reviews, 4 coupons and 6 lookbook entries. Then open http://localhost:3000.

The deployed project already has a `.env` pointing at the same Neon database, so `npm run dev` works against live data out of the box.

### Demo logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@radhekrishna.in` | set via `ADMIN_PASSWORD` (see your deploy notes) |
| Customer | `ananya@example.com` | `demo1234` |

The sign-in page shows one-click demo buttons **only outside production**. Set `NEXT_PUBLIC_SHOW_DEMO_LOGINS=1` to force them on (don't, on a public URL).

### Coupons seeded

`WELCOME10` (10% off above ₹999, capped ₹500) · `FESTIVE500` (₹500 off above ₹2,999) · `BRIDAL15` (15% off above ₹4,999, capped ₹1,500) · `FREESHIP` (free shipping, any order)

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Prisma generate + production build |
| `npm start` | Serve the production build |
| `npm run setup` | Generate client + create DB + seed (first-time setup) |
| `npm run db:seed` | Re-seed (wipes and rebuilds catalogue data) |
| `npm run db:reset` | Force-reset the schema, then re-seed |
| `npm run db:push` | Apply `schema.prisma` changes to the DB |

---

## What's built

**Storefront** — Home (hero, category rail, atelier selection, editorial split, bestsellers, occasion tiles, new arrivals, testimonials, lookbook teaser, newsletter), shop with filters (material / occasion / colour / price band / in-stock) + 6 sort modes + pagination, 10 category pages, product detail with 3-image gallery and hover-zoom, type-ahead search overlay, cart drawer + full cart page, checkout, order confirmation with tracking timeline.

**Accounts** — Register / sign in (JWT in an httpOnly cookie, bcrypt hashing), account overview, order history, saved addresses, wishlist that syncs local → server on sign-in, product reviews with star ratings.

**Admin** (`/admin`) — Dashboard (revenue, orders, AOV, low stock, best sellers), product CRUD with image management and live/hidden toggle, order management with status + payment controls, coupon builder, customer list with lifetime value, contact-message inbox.

**Extras** — Coupon engine, WhatsApp order button that pre-fills the cart, recently-viewed rail, newsletter capture, contact form, lookbook/blog, FAQ, About, and four policy pages.

---

## Things worth knowing

**Business details live in one file.** Phone, WhatsApp number, email, address, hours, social links, free-shipping threshold and flat shipping rate are all in [`src/lib/site.ts`](src/lib/site.ts). They are currently **placeholders** — replace them before going live.

**Payments are simulated.** Cash on delivery is fully functional. The "pay online" path shows a UPI/card screen and marks the order paid without contacting a gateway; no card details are collected. To take real payments, wire a provider (Razorpay, Stripe) into `src/app/api/orders/route.ts` where `paymentStatus` is set.

**Order totals are recalculated server-side.** Prices, discounts and shipping are re-read from the database in the orders API — client-supplied totals are never trusted. Stock is decremented in the same transaction, and cancelling an order in admin returns stock to the shelf.

**Auth is enforced in middleware, not layouts.** [`src/middleware.ts`](src/middleware.ts) gates `/admin` and `/account` before rendering. This matters: Next renders layouts and their pages concurrently, so a guard that only lives in `layout.tsx` can stream page data to the browser before its redirect fires. API routes additionally re-check with `requireAdmin()`.

**No root `loading.tsx`.** A loading file at the app root creates a Suspense boundary that flushes a 200 response before `notFound()` can run, turning every missing product into a soft 404. Loading skeletons are scoped to `/shop` instead.

**Images come from Pexels over the network.** Product photos are live stock-photo URLs, so the catalogue needs internet to display. Allowed hosts are listed in `next.config.mjs` — add your own CDN there before using it, or images will silently fail to optimise. To use your own photos, add the URLs through the admin product form.

**Search uses Postgres `ILIKE`** (`contains` with `mode: 'insensitive'`). Postgres `contains` is case-*sensitive* by default, unlike SQLite's `LIKE` — dropping the mode flag silently breaks lowercase queries. It is unindexed, so move to full-text search if the catalogue grows into the thousands.

---

## Deploying

Already deployed to Vercel: project `radhe-krishna-jewellery` under the `bettercars-projects` team, with a Neon Postgres store (`neon-bole-arrow`) attached through the Marketplace integration.

```bash
npx vercel deploy --prod    # redeploy after changes
npx vercel logs <url>       # tail runtime logs
```

**How the build works.** `npm run build` runs `prisma generate && prisma db push && next build`. The `db push` is idempotent — it syncs schema changes on each deploy and no-ops when nothing changed. It never destroys data without `--accept-data-loss`, so a destructive schema change will fail the build rather than drop a column silently.

**Environment variables.** Neon injects `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) into all environments automatically. `AUTH_SECRET` is set manually for production, preview and development. Prisma uses the pooled URL for queries and the direct URL for DDL, since schema changes over PgBouncer are unreliable.

**Seeding production.** The seed wipes the catalogue, so it refuses to run against a database that already holds orders. Override deliberately:

```bash
FORCE_SEED=1 npm run db:seed
```

**Never commit `.env`, `.env.local` or `.vercel`** — they hold live database credentials. All three are gitignored.

## Project layout

```
prisma/
  schema.prisma      Data model (12 models, PostgreSQL)
  seed.ts            Deterministic catalogue seeder
  images.json        Verified stock-photo URL pools
src/
  app/               Routes: storefront, account, admin, API
  components/        UI, product, cart, checkout, admin components
  lib/               prisma, auth, session, queries, utils, site config
  middleware.ts      Route guards for /admin and /account
  store/             Zustand stores (cart, wishlist, UI, recently viewed)
```
