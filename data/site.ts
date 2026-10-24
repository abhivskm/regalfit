import type { NavLink, SocialLink } from "./types";

/**
 * Brand-wide settings: name, tagline, SEO text, navigation and contact details.
 * Edit here and every section, the footer and the page metadata update together.
 */
export const site = {
  name: "Regal Fit",
  descriptor: "Men's Wear",
  tagline: "Dressed to Command.",
  description:
    "Regal Fit is a Bhopal menswear brand for streetwear and daily wear: oversized tees, hoodies, shirts, cargos, jeans and jackets. Order on WhatsApp or visit our store.",
  // Set NEXT_PUBLIC_SITE_URL in production; used for canonical URLs, Open Graph and the sitemap.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.regalfit.com",
  locale: "en_IN",
  // Bump when content changes; used as the sitemap's lastModified date.
  lastUpdated: "2026-10-24",
  keywords: [
    "Regal Fit",
    "streetwear Bhopal",
    "men's daily wear",
    "oversized t-shirts",
    "men's hoodies",
    "cargo pants",
    "menswear Bhopal",
  ],
} as const;

/** Messages in the black announcement bar at the very top. The first one is shown on mobile. */
export const announcements = [
  "New drops every Friday",
  "Easy ordering on WhatsApp",
  "Store: Ayodhya Bypass, Bhopal",
];

export const nav: NavLink[] = [
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Shop", href: "#shop" },
  { label: "Combos", href: "#combos" },
  { label: "Winterwear", href: "#winter" },
  { label: "Reviews", href: "#reviews" },
  { label: "Store", href: "#contact" },
];

export const contact = {
  addressLines: ["Narela Shankari, Ayodhya Bypass", "Bhopal, Madhya Pradesh"],
  phoneHref: "tel:+917067459174",
  // Country code + number, digits only (used for wa.me links).
  whatsappNumber: "917067459174",
  // PLACEHOLDER: replace with the store's real inbox.
  email: "hello@regalfit.com",
  // PLACEHOLDER: confirm the store's opening hours.
  hours: ["Monday – Saturday: 11 am – 9 pm", "Sunday: 12 pm – 8 pm"],
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Narela+Shankari%2C+Ayodhya+Bypass%2C+Bhopal",
};

export const social: SocialLink[] = [
  // PLACEHOLDER: replace with the brand's profile URLs.
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
  { platform: "whatsapp", label: "WhatsApp", href: "https://wa.me/917067459174" },
];

export const contactIntro = {
  eyebrow: "Visit the Store",
  title: "Try It On in Bhopal",
  description:
    "Drop by to check sizes and fabrics, or message us on WhatsApp and we will keep your pick aside.",
};

/** Short brand paragraph shown in the footer. */
export const aboutText =
  "Regal Fit makes everyday clothes for the way you actually live: oversized tees, heavyweight hoodies, easy shirts and cargos built to be worn hard and washed often. Designed and sold in Bhopal.";
