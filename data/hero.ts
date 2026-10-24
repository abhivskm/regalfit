import type { HeroSlide } from "./types";

/** Time each hero slide stays on screen before auto-advancing. */
export const heroIntervalMs = 3000;

/** Hero slideshow, in display order. The first slide is the one search engines and slow connections see first. */
export const heroSlides: HeroSlide[] = [
  {
    id: "new-drop",
    eyebrow: "New Drop · Winter '26",
    title: "Street Ready.",
    intro: "Oversized tees, hoodies and jackets built for everyday plans. Fresh styles every Friday.",
    cta: { label: "Shop New Arrivals", href: "#new-arrivals" },
    // First slide = the page's largest image, so keep it a photo that compresses well.
    image: {
      src: "https://images.unsplash.com/photo-1628030328071-538b251a4455",
      alt: "Man in a red check flannel over a white hoodie, seated on a ledge",
    },
  },
  {
    id: "layer-up",
    eyebrow: "Jackets & Overshirts",
    title: "Layer Up.",
    intro: "Zip jackets, truckers and overshirts. Throw one over a tee and you're done.",
    cta: { label: "Shop Jackets", href: "#shop-jackets" },
    image: {
      src: "https://images.unsplash.com/photo-1586231912972-d0970f9ce787",
      alt: "Man in a black zip jacket and white tee in front of a graffiti wall",
    },
  },
  {
    id: "cargo-season",
    eyebrow: "Joggers & Cargos",
    title: "Cargo Season.",
    intro: "Relaxed utility cargos with room to move and pockets that actually work.",
    cta: { label: "Shop Cargos", href: "#shop-joggers-cargos" },
    image: {
      src: "https://images.unsplash.com/photo-1711888386245-9ca3477a5977",
      alt: "Man in a stone trucker jacket and black cargo pants on outdoor stairs",
    },
  },
  {
    id: "winter",
    eyebrow: "Winter Rollout",
    title: "Built for Cold Days.",
    intro: "Heavyweight hoodies, sweatshirts and jackets that keep you warm without the bulk.",
    cta: { label: "Shop Winterwear", href: "#winter" },
    image: {
      src: "https://images.unsplash.com/photo-1532332248682-206cc786359f",
      alt: "Black-and-white photo of a man in a shearling-collar leather jacket",
    },
  },
];
