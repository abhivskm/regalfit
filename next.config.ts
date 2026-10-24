import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Every <Image> goes through lib/image-loader.ts, which asks the image's own CDN
    // (Cloudinary or Unsplash) for a resized, modern-format file. No server-side optimizer needed.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Widths offered in each srcset (defaults plus 480 and 1440, which match the grid and common laptops).
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 480],
    // Allowed quality values: 60 for the large hero photos, 75 everywhere else.
    qualities: [60, 75],
  },
  experimental: {
    // Inline Tailwind's (small) stylesheet into the HTML, removing a render-blocking request.
    inlineCss: true,
  },
  turbopack: {
    // Pin the project root (a stray lockfile in a parent folder would otherwise confuse Turbopack).
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
