import type { Category, CategorySlug } from "./types";

export const categoriesIntro = {
  eyebrow: "Quick Shop",
  title: "Shop by Category",
  description: "Find your fit in seconds.",
};

/** Categories, in display order. Used by the category carousel and the "Shop All" filter. */
export const categories: Category[] = [
  {
    slug: "oversized-tees",
    name: "Oversized Tees",
    image: {
      src: "https://images.unsplash.com/photo-1702388519753-b02fc42f0b78",
      alt: "Man in a navy oversized drop-shoulder tee leaning on a concrete wall",
    },
  },
  {
    slug: "shirts",
    name: "Shirts",
    image: {
      src: "https://images.unsplash.com/photo-1771340183956-6f69d2d08f43",
      alt: "Man in a beige check overshirt and sunglasses in a park",
    },
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    image: {
      src: "https://images.unsplash.com/photo-1611817757591-c3f345024273",
      alt: "Man in a mocha hoodie with the hood up in front of city buildings",
    },
  },
  {
    slug: "sweatshirts",
    name: "Sweatshirts",
    image: {
      src: "https://images.unsplash.com/photo-1714023498660-e4c470b285b7",
      alt: "Young man in a mint crewneck sweatshirt against a green wall",
    },
  },
  {
    slug: "joggers-cargos",
    name: "Joggers & Cargos",
    image: {
      src: "https://images.unsplash.com/photo-1620138996011-943081eb5a10",
      alt: "Close-up of olive cargo joggers worn with leather boots",
    },
  },
  {
    slug: "jeans",
    name: "Jeans",
    image: {
      src: "https://images.unsplash.com/photo-1714143164072-7646ef5cb24d",
      alt: "Pair of mid-blue slim jeans on a white background",
    },
  },
  {
    slug: "polos",
    name: "Polos",
    image: {
      src: "https://images.unsplash.com/photo-1720514496268-44bb31c03815",
      alt: "Three polo shirts in navy, white and grey laid flat",
    },
  },
  {
    slug: "jackets",
    name: "Jackets",
    image: {
      src: "https://images.unsplash.com/photo-1614693348454-1e0710d21c60",
      alt: "Man in a sherpa-lined denim jacket and black beanie",
    },
  },
];

export const categoryName = (slug: CategorySlug) => categories.find((c) => c.slug === slug)?.name ?? "";
