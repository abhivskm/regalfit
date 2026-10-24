import { upload } from "@vercel/blob/client";
import { UPLOAD_WIDTHS } from "./blob-images";

/**
 * Browser-side photo upload for the admin portal.
 * Resizes the photo into each of UPLOAD_WIDTHS (WebP where the browser supports it, else JPEG)
 * and sends them straight to Vercel Blob. Returns the URL of the largest version.
 */
export async function uploadPhoto(file: File, onProgress?: (percent: number) => void): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPG, PNG or WebP).");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo format isn't supported. Please use a JPG or PNG photo.");
  }

  const format = supportsWebp() ? { type: "image/webp", ext: "webp" } : { type: "image/jpeg", ext: "jpg" };
  const id = crypto.randomUUID();
  let url = "";

  try {
    for (const [i, width] of UPLOAD_WIDTHS.entries()) {
      const blob = await resize(bitmap, width, format.type);
      const result = await upload(`uploads/${id}/${width}.${format.ext}`, blob, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: format.type,
      });
      url = result.url;
      onProgress?.(Math.round(((i + 1) / UPLOAD_WIDTHS.length) * 100));
    }
  } finally {
    bitmap.close();
  }
  return url;
}

function supportsWebp(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

/** Scales the photo down to `width` (never up) on a white background. */
function resize(bitmap: ImageBitmap, width: number, type: string): Promise<Blob> {
  const targetWidth = Math.min(width, bitmap.width);
  const targetHeight = Math.round((bitmap.height * targetWidth) / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new Error("Could not process the photo."));
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process the photo."))), type, 0.82),
  );
}
