import type { Highlight, Review } from "./types";

export const reviewsIntro = {
  eyebrow: "Real Reviews",
  title: "Approved by Bhopal",
  description: "Real words from people who wear Regal Fit every day.",
};

// PLACEHOLDER: sample reviews. Replace with real customer words (with permission).
export const reviews: Review[] = [
  {
    quote:
      "The oversized tees have the perfect drop-shoulder fit, and the colour hasn't faded after months of washing.",
    name: "Arjun P.",
    product: "Black Contrast-Trim Oversized Tee",
    rating: 5,
  },
  {
    quote:
      "Ordered cargos on WhatsApp in the morning and picked them up from the store the same evening. Super easy.",
    name: "Faiz K.",
    product: "Olive Relaxed Cargo Pants",
    rating: 5,
  },
  {
    quote: "The hoodie is thick and warm without being bulky. Already planning to get the charcoal one too.",
    name: "Siddharth M.",
    product: "Sand Pullover Hoodie",
    rating: 5,
  },
  {
    quote: "Good quality at a fair price. The polo combo is honestly the best deal in town.",
    name: "Rahul T.",
    product: "Any 2 Polos combo",
    rating: 4,
  },
];

// PLACEHOLDER: confirm the exchange policy and fabric claims before launch.
export const highlights: Highlight[] = [
  {
    icon: "fabric",
    title: "Premium Fabrics",
    text: "Heavyweight cottons and soft fleece that keep their shape wash after wash.",
  },
  {
    icon: "exchange",
    title: "Easy Exchange",
    text: "Wrong size? Exchange it at our Bhopal store within 7 days.",
  },
  {
    icon: "whatsapp",
    title: "Order on WhatsApp",
    text: "Send us the product and your size. We confirm stock in minutes.",
  },
  {
    icon: "store",
    title: "Try In-Store",
    text: "Visit us on Ayodhya Bypass, Bhopal and check the fit before you buy.",
  },
];
