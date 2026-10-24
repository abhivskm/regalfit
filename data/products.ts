import type { Product } from "./types";

// PLACEHOLDER: prices, MRPs and product names are samples. Replace with the real catalogue.

export const newArrivalsIntro = {
  eyebrow: "New Arrivals",
  title: "Fresh Drops",
  description: "Get them before everyone else does.",
};

export const shopIntro = {
  eyebrow: "Shop All",
  title: "Everyday Fits",
  description: "Pick a category, choose your piece and order it on WhatsApp.",
};

/** The full catalogue, in display order. Tag a product "new" to show it in New Arrivals. */
export const products: Product[] = [
  {
    id: "black-contrast-trim-tee",
    name: "Black Contrast-Trim Oversized Tee",
    category: "oversized-tees",
    price: 699,
    mrp: 1499,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1622519407650-3df9883f76a5",
      alt: "Smiling man in a black oversized tee with contrast trim and blue jeans",
    },
  },
  {
    id: "on-air-graphic-tee",
    name: "On Air Graphic Oversized Tee",
    category: "oversized-tees",
    price: 649,
    mrp: 1299,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1775979654476-89575df179bd",
      alt: "Man in a black oversized tee with a red 'On Air, Always Extra' graphic",
    },
  },
  {
    id: "sand-pullover-hoodie",
    name: "Sand Pullover Hoodie",
    category: "hoodies",
    price: 1299,
    mrp: 2999,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5",
      alt: "Man in a sand-coloured pullover hoodie leaning on a wall",
    },
  },
  {
    id: "olive-relaxed-cargo",
    name: "Olive Relaxed Cargo Pants",
    category: "joggers-cargos",
    price: 1099,
    mrp: 2499,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1714030282710-4f003762bfb1",
      alt: "Man in a white tee and olive cargo pants against a black backdrop",
    },
  },
  {
    id: "classic-blue-denim-jacket",
    name: "Classic Blue Denim Jacket",
    category: "jackets",
    price: 1799,
    mrp: 3999,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1555583743-991174c11425",
      alt: "Man in a washed blue denim jacket and white tee",
    },
  },
  {
    id: "navy-pique-polo",
    name: "Navy Pique Polo",
    category: "polos",
    price: 799,
    mrp: 1699,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1625910513399-c9fcba54338c",
      alt: "Smiling man in a navy pique polo",
    },
  },
  {
    id: "plaid-flannel-overshirt",
    name: "Plaid Flannel Overshirt",
    category: "shirts",
    price: 1099,
    mrp: 2499,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1790688637587-f352d0b4881d",
      alt: "Man in a plaid flannel overshirt over a white tee on stone steps",
    },
  },
  {
    id: "off-white-fleece-hoodie",
    name: "Off-White Fleece Hoodie",
    category: "hoodies",
    price: 1299,
    mrp: 2999,
    tags: ["new"],
    image: {
      src: "https://images.unsplash.com/photo-1688111421205-a0a85415b224",
      alt: "Bearded man in an off-white fleece hoodie",
    },
  },
  {
    id: "flawless-graphic-tee",
    name: "Flawless Graphic Tee",
    category: "oversized-tees",
    price: 649,
    mrp: 1299,
    tags: ["bestseller"],
    image: {
      src: "https://images.unsplash.com/photo-1775817104298-522393e1d72b",
      alt: "Man in a black tee with a lime 'Flawless' graphic print",
    },
  },
  {
    id: "white-signature-tee",
    name: "White Signature Oversized Tee",
    category: "oversized-tees",
    price: 599,
    mrp: 1199,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1593278641722-49b1047ede21",
      alt: "Man in a white oversized tee and bucket hat in a city park",
    },
  },
  {
    id: "black-everyday-tee",
    name: "Black Everyday Crew Tee",
    category: "oversized-tees",
    price: 449,
    mrp: 899,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90",
      alt: "Close-up of a black crew-neck t-shirt",
    },
  },
  {
    id: "red-check-flannel",
    name: "Red Check Flannel Shirt",
    category: "shirts",
    price: 999,
    mrp: 2299,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1698857494817-d244cb4231a8",
      alt: "Bearded man buttoning a red check flannel shirt over a black tee",
    },
  },
  {
    id: "charcoal-everyday-hoodie",
    name: "Charcoal Everyday Hoodie",
    category: "hoodies",
    price: 1199,
    mrp: 2799,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1677538537484-324385aff147",
      alt: "Man in a charcoal hoodie in a parking garage",
    },
  },
  {
    id: "blue-brushstroke-hoodie",
    name: "Blue Brushstroke Graphic Hoodie",
    category: "hoodies",
    price: 1399,
    mrp: 2999,
    tags: ["bestseller"],
    image: {
      src: "https://images.unsplash.com/photo-1728394604722-c1007e3edf09",
      alt: "Man in a blue graphic hoodie and sunglasses under autumn trees",
    },
  },
  {
    id: "grey-melange-sweatshirt",
    name: "Grey Melange Crew Sweatshirt",
    category: "sweatshirts",
    price: 999,
    mrp: 2299,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1649114383220-c4f0f0dbafbe",
      alt: "Man in a grey crewneck sweatshirt and cap on a smoky city street",
    },
  },
  {
    id: "black-utility-cargo",
    name: "Black Utility Cargo Pants",
    category: "joggers-cargos",
    price: 1099,
    mrp: 2499,
    tags: ["bestseller"],
    image: {
      src: "https://images.unsplash.com/photo-1638412326564-47ec4b061636",
      alt: "Man in an olive tee and black cargo pants on a rooftop",
    },
  },
  {
    id: "black-slim-joggers",
    name: "Black Slim-Fit Joggers",
    category: "joggers-cargos",
    price: 899,
    mrp: 1999,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1635969506664-9d490128ba30",
      alt: "Man in a black tee and black slim joggers walking past glass doors",
    },
  },
  {
    id: "black-ripped-slim-jeans",
    name: "Black Ripped Slim Jeans",
    category: "jeans",
    price: 1199,
    mrp: 2699,
    tags: ["bestseller"],
    image: {
      src: "https://images.unsplash.com/photo-1623629225725-23a723fd5bd3",
      alt: "Man in a white tee and black ripped jeans perched on a metal rail",
    },
  },
  {
    id: "black-tipped-polo",
    name: "Black Tipped Polo",
    category: "polos",
    price: 849,
    mrp: 1799,
    tags: ["bestseller"],
    image: {
      src: "https://images.unsplash.com/photo-1744551358258-5a5b9b268eca",
      alt: "Man in a black polo with white tipping",
    },
  },
  {
    id: "black-sherpa-trucker",
    name: "Black Sherpa Trucker Jacket",
    category: "jackets",
    price: 2199,
    mrp: 4999,
    tags: [],
    image: {
      src: "https://images.unsplash.com/photo-1549237511-bbe6a0979d6a",
      alt: "Man in a black sherpa-collar trucker jacket",
    },
  },
];
