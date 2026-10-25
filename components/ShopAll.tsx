"use client";

import { useEffect, useState } from "react";
import { shopIntro } from "@/data/products";
import type { Category, CategorySlug, Product } from "@/data/types";
import { ProductCard } from "./ProductCard";
import { Container } from "./ui/Container";
import { SectionHeading } from "./ui/SectionHeading";

type Filter = "all" | CategorySlug;

const HASH_PREFIX = "#shop-";

/**
 * Full product grid with category tabs. Category links elsewhere on the page point to
 * `#shop-<slug>`; this section listens for that hash and applies the matching filter.
 */
export function ShopAll({ products, categories }: { products: Product[]; categories: Category[] }) {
  const label = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? products : products.filter((p) => p.category === filter);

  useEffect(() => {
    const onHashChange = () => {
      const slug = window.location.hash.slice(HASH_PREFIX.length);
      if (window.location.hash.startsWith(HASH_PREFIX) && categories.some((c) => c.slug === slug)) setFilter(slug);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [categories]);

  const chooseFilter = (next: Filter) => {
    setFilter(next);
    // Reset the hash so clicking the same category link again still triggers a hashchange.
    if (window.location.hash.startsWith(HASH_PREFIX)) history.replaceState(null, "", "#shop");
  };

  const tabs: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <section id="shop" aria-labelledby="shop-title" className="relative py-12 md:py-16">
      {/* Scroll targets for the category links, at the top of the section. */}
      {categories.map((c) => (
        <span key={c.slug} id={`shop-${c.slug}`} aria-hidden="true" className="absolute top-0" />
      ))}

      <Container>
        <SectionHeading id="shop-title" {...shopIntro} />

        <div
          role="group"
          aria-label="Filter products by category"
          className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:justify-center md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map(({ value, label }) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => chooseFilter(value)}
                className={`shrink-0 rounded-full border px-4 py-2 font-display text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                  active ? "border-ink bg-ink text-ivory" : "border-line bg-ivory text-ink hover:border-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">New styles in this category are coming soon.</p>
        )}

        <p className="sr-only" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "product" : "products"}
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} categoryLabel={label(product.category)} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
