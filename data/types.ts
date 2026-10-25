/**
 * Content types. These mirror what a headless CMS would return, so moving content
 * from these files to a CMS later only changes where the data is loaded from.
 */

/** An image plus its description. `src` formats are listed in lib/image-loader.ts. */
export type ImageAsset = {
  src: string;
  alt: string;
};

export type NavLink = {
  label: string;
  href: string;
};

/** URL-safe category id, e.g. "oversized-tees". Created from the name and never changed afterwards. */
export type CategorySlug = string;

/** A product category. Its slug powers the "Shop All" filter and `#shop-<slug>` links. */
export type Category = {
  slug: CategorySlug;
  name: string;
  image: ImageAsset;
};

export type ProductTag = "new" | "bestseller";

export type Product = {
  id: string;
  name: string;
  category: CategorySlug;
  /** Selling price in rupees. */
  price: number;
  /** Maximum retail price in rupees (shown struck through). */
  mrp: number;
  image: ImageAsset;
  tags: ProductTag[];
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  cta: NavLink;
  image: ImageAsset;
};

/** Coupon-style card in the offer strip under the hero. */
export type Offer = {
  title: string;
  detail: string;
  code?: string;
};

export type Combo = {
  id: string;
  title: string;
  detail: string;
  price: number;
  mrp: number;
  image: ImageAsset;
};

/** An image tile that links somewhere on the page (e.g. the Winter Rollout cards). */
export type PromoTile = {
  title: string;
  href: string;
  image: ImageAsset;
};

export type Review = {
  quote: string;
  name: string;
  /** What the customer bought. */
  product: string;
  /** 1–5 stars. */
  rating: number;
};

export type HighlightIcon = "fabric" | "exchange" | "whatsapp" | "store";

export type Highlight = {
  icon: HighlightIcon;
  title: string;
  text: string;
};

export type SocialPlatform = "instagram" | "facebook" | "whatsapp";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};
