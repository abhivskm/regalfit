/**
 * Generates every brand image the site uses from one source logo.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Input:  assets/brand/logo-source.png  (gold logo on a black background)
 * Output:
 *   public/images/brand/logo-gold.png      full logo, transparent (dark surfaces)
 *   public/images/brand/monogram-gold.png  crown + "RF" mark, transparent, glow trimmed (light surfaces)
 *   app/icon.png, app/apple-icon.png       favicons (monogram on black)
 *   app/opengraph-image.jpg                1200x630 social share image
 *
 * Uses `sharp`, which ships with Next.js, so no extra dependency is needed.
 * If you replace the logo, update the REGION values below to match the new layout.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "assets/brand/logo-source.png";
const BLACK = { r: 11, g: 11, b: 11, alpha: 1 };

// Pixel rows in the source image (found by scanning for non-black rows).
// The first 10 columns are cropped off: the source screenshot has a grey edge.
const REGION = {
  left: 10,
  monogram: { top: 80, bottom: 368 }, // crown + RF
  full: { top: 80, bottom: 545 }, // crown, RF, wordmark and "MEN'S WEAR"
};

/**
 * Turns a "light on black" image into a transparent one: brightness becomes alpha and
 * colour is un-premultiplied, so the gold looks identical when placed on any dark surface.
 * For light surfaces, `cutoff` raises the alpha floor (stripping the soft glow) and
 * `tone` keeps the logo's own shading, slightly deepened, so the gold holds up on white.
 */
async function blackToAlpha(input, { cutoff = 0.06, tone = 0 } = {}) {
  const { data, info } = await input.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const a = Math.max(r, g, b) / 255;
    const alpha = a <= cutoff ? 0 : Math.min(1, (a - cutoff) / (1 - cutoff));
    // tone = 0: un-premultiplied (for dark surfaces); tone > 0: original shading scaled by tone.
    const k = tone ? tone : a ? 1 / a : 0;
    out[q] = Math.min(255, r * k);
    out[q + 1] = Math.min(255, g * k);
    out[q + 2] = Math.min(255, b * k);
    out[q + 3] = Math.round(alpha * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).trim();
}

function crop({ top, bottom }, meta) {
  return sharp(SOURCE).extract({
    left: REGION.left,
    top,
    width: meta.width - REGION.left,
    height: bottom - top,
  });
}

const meta = await sharp(SOURCE).metadata();
await mkdir("public/images/brand", { recursive: true });

// Transparent logos.
const fullLogo = await (await blackToAlpha(crop(REGION.full, meta))).png().toBuffer();
// Sized at 2x their display size (footer logo 176px wide, navbar mark 40px tall).
await sharp(fullLogo).resize({ width: 352 }).png({ compressionLevel: 9 }).toFile("public/images/brand/logo-gold.png");

const monogramSoft = await (await blackToAlpha(crop(REGION.monogram, meta))).png().toBuffer();
const monogramCrisp = await (await blackToAlpha(crop(REGION.monogram, meta), { cutoff: 0.3, tone: 0.8 })).png().toBuffer();
await sharp(monogramCrisp).resize({ height: 80 }).png({ compressionLevel: 9 }).toFile("public/images/brand/monogram-gold.png");

// Favicons: the monogram centred on a black square.
async function icon(size, file) {
  const mark = await sharp(monogramSoft)
    .resize({ width: Math.round(size * 0.78), height: Math.round(size * 0.78), fit: "inside" })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BLACK } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(file);
}
await icon(512, "app/icon.png");
await icon(180, "app/apple-icon.png");

// Open Graph image: full logo centred on black.
const ogLogo = await sharp(fullLogo).resize({ height: 440 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BLACK } })
  .composite([{ input: ogLogo, gravity: "center" }])
  .jpeg({ quality: 88 })
  .toFile("app/opengraph-image.jpg");

console.log("Brand assets generated.");
