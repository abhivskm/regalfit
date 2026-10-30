# Regal Fit — Streetwear & Daily Wear

A single-page site for **Regal Fit Men's Wear**, a Bhopal menswear brand for streetwear and daily wear.
The layout follows Indian e-commerce sites such as Beyoung:

- announcement bar
- auto-sliding hero banners
- offer strip
- "Shop by Category" carousel
- New Arrivals
- Combos
- Winter Rollout
- a filterable "Shop All" grid
- reviews
- trust strip
- store and contact section

Product cards show the price, the MRP struck through and the % discount. **Buy on WhatsApp** opens a chat with the
store, pre-filled with the product name and price. There is no cart, payment, backend or database.

Built with Next.js 16 (App Router, Cache Components), TypeScript and Tailwind CSS v4.
The only runtime dependencies are `next`, `react` and `react-dom`.

---

## Getting started

Requires **Node.js 20.9+** (Node 22 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:3000  (use `npm run dev -- --port 3100` if 3000 is taken)
```

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Development server with hot reload   |
| `npm run build` | Production build (fully static)      |
| `npm start`     | Serve the production build           |
| `npm run lint`  | ESLint                               |

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL`: the live domain (used for canonical URLs, Open Graph and the sitemap).
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: optional, see [Images and Cloudinary](#images-and-cloudinary).

---

## Admin portal

The client manages the site at **`/admin`** (e.g. https://regalfit.vercel.app/admin). There is no
redeploy: clicking **Save changes** updates the live website immediately.

| Tab | What the client can do |
| --- | --- |
| **Products & prices** | Add or remove products; edit name, category, price, MRP; tick *New* / *Bestseller*; change the photo |
| **Slides** | Add, remove and reorder home page slides; edit heading, text, button; change the photo |
| **Combos** | Add or remove combo deals; edit name, price, MRP and photo |
| **Categories** | Add, rename, reorder and remove categories; change each category's photo (a category with products can only be removed after its products are moved) |

How it works:

- **Login:** a single password (`ADMIN_PASSWORD`), with a signed, http-only cookie valid for 7 days.
  Changing the password logs out every device.
- **Storage:** content and photos live in **Vercel Blob** (store `regalfit-media`).
  - Each save writes a new JSON version; the newest wins and the last 5 are kept as backups.
  - Until the first save, the site uses the content in `/data`, so nothing is lost.
- **Photos:** the browser resizes each upload into 4 widths (480–2400px, WebP) and sends them straight to Blob.
  The image loader serves the smallest width that fits, so phone photos never slow the site down.
  Photos that are replaced or removed are deleted from storage on save.
- **Checks:** everything is validated on the server before saving, with clear messages
  (e.g. "Product 3: price can't be more than the MRP.").
- **Kept out of Google:** `/admin` has `noindex` and is disallowed in `robots.txt`.

To change the admin password: Vercel dashboard → Project → Settings → Environment Variables → edit
`ADMIN_PASSWORD` → redeploy. Locally, set the same variables in `.env.local` (see `.env.example`).

The text sections (announcement bar, offers, Winter Rollout, reviews, contact details) are still edited in `/data`.

---

## Visitor tracking (admin → Tracking)

`/admin/tracking` shows, for Today / Last 7 days / Last 30 days:

- **Live now:** visitors active in the last minute. The whole page refreshes every 5 s while it is open.
- **Visits and visitors** (new vs returning), **WhatsApp clicks, call clicks, enquiries.**
- **Visits per day** (or per hour for Today).
- **Products:** how often each product was seen on screen, its "Buy on WhatsApp" taps, and the conversion %.
  Products seen 20+ times with no enquiries are flagged.
- **Where visitors came from** (Instagram, Google, WhatsApp, direct…), **cities**, **devices**, and clicks on
  **categories, combos and slides**.
- **Live activity feed**, and **contact-form enquiries** (mark New / Contacted / Done, download as CSV).

How it works:

- **No login for customers.** `components/Tracker.tsx` keeps a random ID in the browser (new vs returning visitors),
  batches events and sends them to `/api/track`. No cookies, no stored IP addresses, no third parties.
- Elements are tracked with attributes: `data-track="whatsapp" data-track-item="<id>" data-track-label="<name>"` for
  clicks, and `data-track-view="product"` for "seen on screen".
- Bots, link previews and the logged-in admin are not counted.
- **Campaign links:** add `?src=<name>` to any link you share, e.g. `https://regalfit.vercel.app/?src=insta-bio` or
  `?src=store-qr`. The dashboard then shows which post, bio link or QR code brought each visitor (first link of a visit wins).
- Data lives in **Neon Postgres** (Vercel Marketplace, free plan, `DATABASE_URL`). Detailed events are kept 90 days, then
  folded into `daily_stats`. Create or update the tables with `node --env-file=.env.local scripts/db-setup.mjs`.
- The contact form saves enquiries (phone optional) and links to the **Privacy Policy** page (`/privacy`).
- Server functions run in Singapore (`vercel.json`), next to the database.

---

## Project structure

```
app/
  layout.tsx            Fonts (Poppins + Inter), SEO metadata, skip link
  page.tsx              Assembles the sections + LocalBusiness structured data (JSON-LD)
  globals.css           Design tokens (colours, fonts), base styles, motion
  sitemap.ts, robots.ts Generated /sitemap.xml and /robots.txt
  icon.png, apple-icon.png, opengraph-image.jpg   Generated from the logo (see below)
components/
  AnnouncementBar, Navbar, Hero (slideshow), Offers, Categories, NewArrivals, ProductCard,
  Combos, Winter, ShopAll (filterable grid), Reviews, Highlights, Contact, ContactForm, Footer
  ui/                   Button, Container, Icons, Reveal (scroll fade-in), ScrollRow (carousel), SectionHeading
data/                   ← all editable content lives here
  site.ts               Brand name, SEO text, announcement messages, nav, contact details, socials
  hero.ts               Hero slides and the auto-slide interval (3 s)
  categories.ts         The 8 categories (also the Shop All filter)
  products.ts           The product catalogue: name, category, price, MRP, image, tags
  promotions.ts         Offer strip, combo deals, Winter Rollout banner and tiles
  testimonials.ts       Customer reviews and the four "why Regal Fit" highlights
  types.ts              Content types (shaped like a CMS schema)
app/admin/               Admin portal: login page, editor page, server actions (login, logout, save)
app/admin/tracking/      Tracking dashboard (visits, products, sources, live feed, enquiries)
app/api/track/           Receives visitor activity from the browser
app/api/admin/upload/    Issues upload tokens for photos (admins only)
app/api/admin/enquiries/ Enquiries CSV download (admins only)
app/privacy/             Privacy Policy page
components/admin/        Admin UI: top bar, editor tabs and panels, photo upload field, tracking dashboard
components/Tracker.tsx   Invisible visitor tracking on the public page
lib/
  analytics.ts          Tracking writes and dashboard queries (Postgres)
  tracker-client.ts     Browser IDs and traffic-source detection
  visit.ts              Device, location headers and bot filtering
  db.ts                 Neon Postgres connection
  enquiry-rules.ts      Contact-form validation (shared by browser and server)
  image-loader.ts       Image loader (Cloudinary / Unsplash / admin uploads / local) + aspect-ratio cropping
  content.ts            Reads/saves admin-edited content in Vercel Blob, with validation
  admin-auth.ts         Password check and signed session cookie
  blob-images.ts        Sizes and URLs of admin-uploaded photos
  upload-photo.ts       Browser-side resize + upload
  commerce.ts           Price formatting, discount %, WhatsApp order links
scripts/generate-brand-assets.mjs   Builds logo, favicon and share image from the source logo
assets/brand/logo-source.png        Original logo (not served)
```

---

## Customising

### Products, prices and content

Everything visitors read is in `/data`. Edit those files and the page updates. No component changes are needed.

- **Add a product:** add an entry to `data/products.ts`.
  - It needs a unique `id`, a `category` slug, a `price` and an `mrp` in rupees.
  - Tag it `"new"` to show it in New Arrivals, or `"bestseller"` for the badge.
  - The discount % is calculated automatically.
- **Categories:** managed in the admin portal (`data/categories.ts` holds the starting list). Category tiles, the menu
  and the footer link to `#shop-<slug>`, which opens Shop All already filtered. A category's slug is created from its
  name once and never changes, so renaming keeps links working.
- **Offers, combos and winter promos:** `data/promotions.ts`.
- **Hero slides:** `data/hero.ts`. Add, remove or reorder slides; change `heroIntervalMs` for the timing.
  Keep the first slide's photo simple (it is the page's largest image and sets the load time).
- **WhatsApp number, phone, address, hours, socials:** `data/site.ts` → `contact`, `social`.
- **Announcement bar:** `data/site.ts` → `announcements`.

### Images and Cloudinary

Images are referenced by URL in `/data`. A custom loader (`lib/image-loader.ts`) asks each image's own CDN
for the right size and a modern format. `src` can be any of:

| Format | Example |
| --- | --- |
| Full Cloudinary URL | `https://res.cloudinary.com/<cloud>/image/upload/v1/regalfit/tee-01.jpg` |
| Cloudinary public ID | `regalfit/tee-01` (needs `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) |
| Unsplash URL | `https://images.unsplash.com/photo-…` (current placeholders) |
| Local file | `/images/brand/logo-gold.png` (place in `/public`) |

The hero asks the CDN for a wide 2:1 crop on tablet/desktop and a tall 3:5 crop on phones (`withAspect()`), so
large portrait photos are never downloaded at full height.

**Swapping in real photography:**

1. Create a free Cloudinary account and upload photos (e.g. into a `regalfit/` folder).
2. Copy each image's URL (or public ID) into the matching `image.src` in `/data`.
3. Update the `alt` text to describe the new photo.

Recommended shapes:

- **Product, category and combo images:** 3:4 portrait, at least 1000px wide.
- **Hero slides:** any shape, at least 2400px on the long side, with the subject near the centre.

**Moving to a CMS later:** the `/data` types mirror a typical CMS schema. To let an admin manage products and
images, connect a headless CMS (e.g. Sanity, Strapi or Payload) with Cloudinary as its media library, then replace
the imports from `/data` with CMS queries. The components don't need to change.

### Logo, favicon and share image

The logo files in `public/images/brand/`, `app/icon.png`, `app/apple-icon.png` and `app/opengraph-image.jpg`
are generated from `assets/brand/logo-source.png`:

```bash
node scripts/generate-brand-assets.mjs
```

If you replace the source logo (ideally with a high-resolution or vector export from the designer), update the
crop rows in `REGION` at the top of the script to match the new layout.

### Colours and fonts

Design tokens are at the top of `app/globals.css`:

| Token | Value | Use |
| --- | --- | --- |
| `ivory` | `#FFFFFF` | Page background |
| `stone` | `#F5F5F4` | Alternate sections, image placeholders |
| `ink` | `#111111` | Text, buttons, dark surfaces |
| `muted` | `#57534E` | Secondary text |
| `line` | `#E7E5E4` | Dividers, card borders |
| `gold` | `#D6AB62` | Sampled from the logo. Accents, or text on dark backgrounds |
| `gold-deep` | `#8A6A2F` | Gold for text on light backgrounds (meets WCAG AA) |
| `sale` | `#15803D` | "% OFF" labels (meets WCAG AA) |

Headings use **Poppins** (bold, uppercase) and body text uses **Inter**, both loaded with `next/font` in `app/layout.tsx`.

### Contact form

The form validates in the browser, but **submissions are not sent anywhere yet**. Before launch, connect it in
`components/ContactForm.tsx` → `handleSubmit`. Either post to a form service such as
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com), or add a Next.js route handler that sends email.

---

## Replace before launch

- [ ] **Products:** names, prices and MRPs in `data/products.ts` are samples.
- [ ] **Photography:** all product, category, hero and promo images are Unsplash placeholders.
- [ ] **Offers and combos:** the codes (`REGAL10`), deals and prices in `data/promotions.ts` are samples.
- [ ] **Claims:** check "320 GSM fleece", the "7-day exchange" and the other highlight text.
- [ ] **Reviews:** sample quotes in `data/testimonials.ts`. Replace them with real customer words, with permission.
- [ ] **Logo source:** `assets/brand/logo-source.png` is cropped from a screenshot. Use the original high-res file.
- [ ] **Email:** `hello@regalfit.com` in `data/site.ts`.
- [ ] **Opening hours:** `data/site.ts` (placeholder hours).
- [ ] **Social links:** Instagram and Facebook point to the platforms' home pages (WhatsApp uses the store number).
- [ ] **Domain:** set `NEXT_PUBLIC_SITE_URL`.
- [ ] **Contact form:** connect a delivery service (see above).

## Deploying

The site builds to static pages, so it runs on Vercel (zero config), Netlify, or any Node host with `npm run build && npm start`.
Set the environment variables in your host's dashboard.

## Notes

- **Lighthouse:** desktop scores about 94–98 for performance and 100 for accessibility, best practices and SEO.
  Mobile performance varies between runs, roughly 78–88, because the placeholder photos come from Unsplash over a
  simulated slow connection. Your own optimised Cloudinary photos should score at the top of that range.
- **Hero slideshow:** an auto-rotating hero keeps changing the screen, which lowers Lighthouse's *Speed Index*.
  A longer `heroIntervalMs` softens this. The slideshow:
  - pauses on hover
  - stops when keyboard users tab into it
  - has a pause button
  - never auto-plays for visitors who have reduced motion turned on
- **Inline CSS:** `experimental.inlineCss` is on in `next.config.ts`. It puts the small Tailwind stylesheet in the
  HTML and removes a render-blocking request. Remove it if a future Next.js version changes the flag.
