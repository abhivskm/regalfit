import { del, list as listBlobs, put } from "@vercel/blob";
import { cacheLife, cacheTag } from "next/cache";
import { categories as seedCategories } from "@/data/categories";
import { heroSlides as seedSlides } from "@/data/hero";
import { products as seedProducts } from "@/data/products";
import { combos as seedCombos } from "@/data/promotions";
import type { Category, Combo, HeroSlide, ImageAsset, Product, ProductTag } from "@/data/types";
import { uploadVariantUrls } from "./blob-images";

/**
 * Everything the admin portal can edit, stored as JSON in Vercel Blob.
 * Until the admin saves for the first time, the site uses the content in /data (the "seed").
 *
 * Each save writes a new file (content/site-<timestamp>-<random>.json) instead of overwriting one:
 * public Blob URLs are cached by the CDN, so a fresh file name is the only way to guarantee the
 * site never reads an old copy. The newest file wins; the last few are kept as backups.
 */
export type SiteContent = {
  heroSlides: HeroSlide[];
  products: Product[];
  combos: Combo[];
  categories: Category[];
};

export const CONTENT_TAG = "site-content";
const CONTENT_PREFIX = "content/site-";
const VERSIONS_TO_KEEP = 5;

export const seedContent: SiteContent = {
  heroSlides: seedSlides,
  products: seedProducts,
  combos: seedCombos,
  categories: seedCategories,
};

export const storageConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Site content for the public pages. Cached; the admin's Save refreshes it via CONTENT_TAG. */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return readContent();
}

/** Latest stored content, uncached (for the admin portal). */
export async function readContent(): Promise<SiteContent> {
  if (!storageConfigured()) return seedContent;
  try {
    const [latest] = await contentVersions();
    if (!latest) return seedContent;
    const response = await fetch(latest.url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Content file returned ${response.status}`);
    return validateContent(await response.json());
  } catch (error) {
    console.error("Could not read site content, falling back to the defaults:", error);
    return seedContent;
  }
}

/** Saves content and deletes uploaded photos that are no longer used anywhere. */
export async function writeContent(next: SiteContent, previous: SiteContent): Promise<void> {
  // A zero-padded timestamp keeps file names in save order.
  await put(`${CONTENT_PREFIX}${String(Date.now()).padStart(15, "0")}.json`, JSON.stringify(next), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });

  const old = (await contentVersions()).slice(VERSIONS_TO_KEEP).map((v) => v.url);

  const stillUsed = new Set(imageUrls(next));
  const unused = imageUrls(previous)
    .filter((url) => !stillUsed.has(url))
    .flatMap(uploadVariantUrls);
  if (unused.length || old.length) {
    // Best effort: a failed clean-up must never fail the save.
    await del([...unused, ...old]).catch((error) => console.error("Could not delete old files:", error));
  }
}

/** Stored content files, newest first. */
async function contentVersions() {
  const { blobs } = await listBlobs({ prefix: CONTENT_PREFIX, limit: 1000 });
  return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
}

const imageUrls = (content: SiteContent) => [
  ...content.heroSlides.map((s) => s.image.src),
  ...content.products.map((p) => p.image.src),
  ...content.combos.map((c) => c.image.src),
  ...content.categories.map((c) => c.image.src),
];

/* ------------------------------------------------------------------
   Validation — everything saved from the admin portal passes through here
   ------------------------------------------------------------------ */

/** A problem the admin can fix; its message is shown in the portal. */
export class ContentError extends Error {}

const LIMITS = { slides: 10, products: 300, combos: 12, categories: 24 };
const TAGS: ProductTag[] = ["new", "bestseller"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function text(value: unknown, label: string, { max = 120, required = true } = {}): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && !result) throw new ContentError(`${label} is required.`);
  if (result.length > max) throw new ContentError(`${label} is too long (max ${max} characters).`);
  return result;
}

function rupees(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 1_000_000) {
    throw new ContentError(`${label} must be a whole number of rupees.`);
  }
  return value;
}

function image(value: unknown, label: string, fallbackAlt: string): ImageAsset {
  const asset = isRecord(value) ? value : {};
  const src = typeof asset.src === "string" ? asset.src.trim() : "";
  if (!src) throw new ContentError(`${label}: please add a photo.`);
  const safe = src.startsWith("/") ? !src.startsWith("//") : URL.canParse(src) && src.startsWith("https://");
  if (!safe || src.length > 500) throw new ContentError(`${label}: the photo link is not valid.`);
  // Alt text describes the photo for Google and screen readers; default to the item's name.
  const alt = typeof asset.alt === "string" && asset.alt.trim() ? asset.alt.trim().slice(0, 300) : fallbackAlt;
  return { src, alt };
}

function link(value: unknown, label: string): string {
  const href = text(value, label, { max: 300 });
  if (!(href.startsWith("#") || (href.startsWith("https://") && URL.canParse(href)))) {
    throw new ContentError(`${label} must be a section of the page or an https:// link.`);
  }
  return href;
}

function list(value: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(value)) throw new ContentError(`${label} are missing.`);
  if (value.length > max) throw new ContentError(`You can have at most ${max} ${label.toLowerCase()}.`);
  return value;
}

function id(value: unknown, label: string): string {
  const result = text(value, `${label} ID`, { max: 64 });
  if (!/^[\w-]+$/.test(result)) throw new ContentError(`${label} has an invalid ID.`);
  return result;
}

function prices(item: Record<string, unknown>, label: string) {
  const price = rupees(item.price, `${label}: price`);
  const mrp = rupees(item.mrp, `${label}: MRP`);
  if (price > mrp) throw new ContentError(`${label}: price can't be more than the MRP.`);
  return { price, mrp };
}

/** Checks and normalises content from the admin portal. Throws ContentError with a readable message. */
export function validateContent(input: unknown): SiteContent {
  if (!isRecord(input)) throw new ContentError("Nothing to save.");

  const heroSlides = list(input.heroSlides, "Slides", LIMITS.slides).map((raw, i): HeroSlide => {
    const s = isRecord(raw) ? raw : {};
    const label = `Slide ${i + 1}`;
    const title = text(s.title, `${label}: heading`, { max: 60 });
    const cta = isRecord(s.cta) ? s.cta : {};
    return {
      id: id(s.id, label),
      eyebrow: text(s.eyebrow, `${label}: small heading`, { max: 50, required: false }),
      title,
      intro: text(s.intro, `${label}: text`, { max: 200, required: false }),
      cta: { label: text(cta.label, `${label}: button text`, { max: 30 }), href: link(cta.href, `${label}: button link`) },
      image: image(s.image, label, title),
    };
  });
  if (!heroSlides.length) throw new ContentError("Keep at least one slide.");

  const categories = list(input.categories, "Categories", LIMITS.categories).map((raw, i): Category => {
    const c = isRecord(raw) ? raw : {};
    const name = text(c.name, `Category ${i + 1}: name`, { max: 30 });
    const slug = typeof c.slug === "string" ? c.slug : "";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 40) {
      throw new ContentError(`Category "${name}" has an invalid ID. Please refresh and try again.`);
    }
    return { slug, name, image: image(c.image, `${name} category`, name) };
  });
  if (!categories.length) throw new ContentError("Keep at least one category.");
  const slugs = categories.map((c) => c.slug);
  if (new Set(slugs).size !== slugs.length) throw new ContentError("Two categories have the same ID. Please refresh and try again.");
  if (new Set(categories.map((c) => c.name.toLowerCase())).size !== categories.length) {
    throw new ContentError("Two categories have the same name.");
  }

  const products = list(input.products, "Products", LIMITS.products).map((raw, i): Product => {
    const p = isRecord(raw) ? raw : {};
    const label = `Product ${i + 1}`;
    const name = text(p.name, `${label}: name`, { max: 80 });
    const category = typeof p.category === "string" ? p.category : "";
    if (!slugs.includes(category)) throw new ContentError(`${label} (${name}): choose a category.`);
    const tags = Array.isArray(p.tags) ? TAGS.filter((t) => (p.tags as unknown[]).includes(t)) : [];
    return { id: id(p.id, label), name, category, ...prices(p, `${label} (${name})`), tags, image: image(p.image, `${label} (${name})`, name) };
  });

  const combos = list(input.combos, "Combos", LIMITS.combos).map((raw, i): Combo => {
    const c = isRecord(raw) ? raw : {};
    const label = `Combo ${i + 1}`;
    const title = text(c.title, `${label}: name`, { max: 40 });
    return {
      id: id(c.id, label),
      title,
      detail: text(c.detail, `${label}: short line`, { max: 60, required: false }),
      ...prices(c, `${label} (${title})`),
      image: image(c.image, `${label} (${title})`, title),
    };
  });

  const ids = [...heroSlides, ...products, ...combos].map((item) => item.id);
  if (new Set(ids).size !== ids.length) throw new ContentError("Two items share the same ID. Please refresh and try again.");

  return { heroSlides, products, combos, categories };
}
