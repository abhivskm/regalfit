import type { Combo, ImageAsset, Offer, PromoTile } from "./types";

// PLACEHOLDER: all offers, codes and combo prices are samples. Replace before launch.

/** Coupon-style cards directly under the hero. */
export const offers: Offer[] = [
  { title: "10% OFF", detail: "on your first purchase", code: "REGAL10" },
  { title: "3 TEES ₹1,499", detail: "mix any oversized tees" },
  { title: "EXTRA 5%", detail: "on WhatsApp orders above ₹1,999" },
];

export const combosIntro = {
  eyebrow: "Combos",
  title: "More Fits, Less Spend",
  description: "Bundle up and save on the pieces you wear every day.",
};

export const combos: Combo[] = [
  {
    id: "three-tees",
    title: "Any 3 Oversized Tees",
    detail: "Mix colours and prints",
    price: 1499,
    mrp: 3897,
    image: {
      src: "https://images.unsplash.com/photo-1627225793904-a2f900a6e4cf",
      alt: "Man wearing a white oversized tee with a back print",
    },
  },
  {
    id: "two-polos",
    title: "Any 2 Polos",
    detail: "Pique cotton, all colours",
    price: 1399,
    mrp: 3398,
    image: {
      src: "https://images.unsplash.com/photo-1625910513520-bed0389ce32f",
      alt: "Smiling man in a black polo shirt outdoors",
    },
  },
  {
    id: "two-cargos",
    title: "Any 2 Cargos",
    detail: "Relaxed or utility fit",
    price: 1799,
    mrp: 4998,
    image: {
      src: "https://images.unsplash.com/photo-1545272957-4a9a90740ce1",
      alt: "Man in a corduroy jacket and grey cargo pants walking",
    },
  },
  {
    id: "hoodie-jogger-set",
    title: "Hoodie + Jogger Set",
    detail: "The full winter uniform",
    price: 1999,
    mrp: 4798,
    image: {
      src: "https://images.unsplash.com/photo-1596075780750-81249df16d19",
      alt: "Man in a black hoodie with his arms crossed",
    },
  },
];

export const winter: {
  eyebrow: string;
  title: string;
  description: string;
  banner: { title: string; text: string; cta: { label: string; href: string }; image: ImageAsset };
  tiles: PromoTile[];
} = {
  eyebrow: "Winter Rollout",
  title: "Layer Season Is Here",
  description: "Warm, heavyweight and built for Bhopal winters.",
  banner: {
    title: "Heavyweight Hoodies",
    text: "320 GSM fleece, brushed inside. Starting ₹1,199.",
    cta: { label: "Shop Hoodies", href: "#shop-hoodies" },
    image: {
      src: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e",
      alt: "Man in a rust hoodie with his hands in the front pocket against dark stairs",
    },
  },
  tiles: [
    {
      title: "Hoodies",
      href: "#shop-hoodies",
      image: {
        src: "https://images.unsplash.com/photo-1685328403732-64be6bb9d112",
        alt: "Close-up of a man in an olive hoodie on a city street",
      },
    },
    {
      title: "Sweatshirts",
      href: "#shop-sweatshirts",
      image: {
        src: "https://images.unsplash.com/photo-1649114383220-c4f0f0dbafbe",
        alt: "Man in a grey crewneck sweatshirt and cap on a smoky city street",
      },
    },
    {
      title: "Jackets",
      href: "#shop-jackets",
      image: {
        src: "https://images.unsplash.com/photo-1616404661184-67bc5d4da4f5",
        alt: "Man in a black denim jacket, white tee and white trousers on a street",
      },
    },
  ],
};
