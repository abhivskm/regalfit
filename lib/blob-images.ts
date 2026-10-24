/**
 * Photos uploaded through the admin portal are stored in Vercel Blob in several widths:
 *
 *   uploads/<uuid>/480.webp, 960.webp, 1600.webp, 2400.webp
 *
 * Content stores the largest one; the image loader swaps in the smallest width that still
 * covers what the browser asked for, so product cards never download a full-size photo.
 */
export const UPLOAD_WIDTHS = [480, 960, 1600, 2400] as const;

const UPLOAD_URL = /^(https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/uploads\/[0-9a-f-]{36}\/)(\d+)\.(webp|jpg)$/;

/** Is this an image uploaded through the admin portal? */
export function isUploadUrl(url: string): boolean {
  return UPLOAD_URL.test(url);
}

/** The stored variant best suited to `width` (falls back to the URL itself for other images). */
export function uploadVariantUrl(url: string, width: number): string {
  const match = url.match(UPLOAD_URL);
  if (!match) return url;
  const best = UPLOAD_WIDTHS.find((w) => w >= width) ?? UPLOAD_WIDTHS[UPLOAD_WIDTHS.length - 1];
  return `${match[1]}${best}.${match[3]}`;
}

/** Every stored variant of an uploaded photo (used to delete them all when a photo is removed). */
export function uploadVariantUrls(url: string): string[] {
  const match = url.match(UPLOAD_URL);
  return match ? UPLOAD_WIDTHS.map((w) => `${match[1]}${w}.${match[3]}`) : [];
}

/** Blob pathname rule enforced by the upload route. */
export const UPLOAD_PATHNAME = /^uploads\/[0-9a-f-]{36}\/(480|960|1600|2400)\.(webp|jpg)$/;
