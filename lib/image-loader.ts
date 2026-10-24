import type { ImageLoaderProps } from "next/image";
import { isUploadUrl, uploadVariantUrl } from "./blob-images";

/**
 * Global next/image loader (configured in next.config.ts).
 *
 * Image `src` values in /data can be any of:
 *   1. A full Cloudinary URL   https://res.cloudinary.com/<cloud>/image/upload/v123/regalfit/look-01.jpg
 *   2. A Cloudinary public ID  regalfit/look-01   (needs NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 *   3. An Unsplash URL         https://images.unsplash.com/photo-...   (current placeholders)
 *   4. A local file            /images/brand/logo-gold.png
 *   5. An admin-portal upload  https://<store>.public.blob.vercel-storage.com/uploads/<id>/2400.webp
 *
 * This keeps the data format CMS-friendly: an admin uploads to Cloudinary and pastes the
 * URL (or the CMS stores the public ID); the loader requests the right size and format.
 */
const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality ?? 75;

  // Admin uploads are stored in several widths; use the smallest that covers the request.
  if (isUploadUrl(src)) return uploadVariantUrl(src, width);

  // Local files in /public are served as-is (the query only satisfies Next's width check).
  if (src.startsWith("/")) return `${src}?w=${width}`;

  // Full Cloudinary delivery URL: insert a resize + auto-format transformation after /upload/.
  if (src.startsWith("https://res.cloudinary.com/")) {
    return src.replace("/image/upload/", `/image/upload/f_auto,q_${q},w_${width},c_limit/`);
  }

  // Unsplash (imgix) understands w / q / auto=format natively.
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(q));
    url.searchParams.set("auto", "format");
    // Keep a crop requested by withAspect(); otherwise just scale down.
    if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
    return url.toString();
  }

  // Bare Cloudinary public ID.
  if (!src.startsWith("http") && CLOUDINARY_CLOUD) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_${q},w_${width},c_limit/${src}`;
  }

  return src;
}

/**
 * Asks the image's CDN to crop it to an aspect ratio (e.g. "2:1") around faces/the subject,
 * so a portrait original isn't downloaded at full height just to fill a wide banner.
 * Local and unknown sources are returned unchanged.
 */
export function withAspect(src: string, ratio: `${number}:${number}`): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("ar", ratio);
    url.searchParams.set("fit", "crop");
    url.searchParams.set("crop", "faces,center");
    return url.toString();
  }
  if (src.startsWith("https://res.cloudinary.com/")) {
    return src.replace("/image/upload/", `/image/upload/ar_${ratio},c_fill,g_auto/`);
  }
  if (!src.startsWith("http") && !src.startsWith("/") && CLOUDINARY_CLOUD) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/ar_${ratio},c_fill,g_auto/${src}`;
  }
  return src;
}
