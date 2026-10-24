"use client";

import type { Category } from "@/data/types";
import { ImageField } from "./ImageField";
import type { ListUpdater } from "./fields";

export function CategoriesPanel({
  categories,
  onChange,
}: {
  categories: Category[];
  onChange: ListUpdater<Category>;
}) {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="font-display text-lg font-bold uppercase">
        Category photos
      </h2>
      <p className="text-sm text-muted">The tiles in &ldquo;Shop by Category&rdquo;. Names stay the same; change the photo.</p>

      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category) => (
          <li key={category.slug} className="rounded-lg bg-ivory p-3 ring-1 ring-line">
            <p className="mb-2 font-display text-xs font-bold uppercase">{category.name}</p>
            <ImageField
              src={category.image.src}
              onChange={(src) =>
                onChange((list) => list.map((c) => (c.slug === category.slug ? { ...c, image: { src, alt: "" } } : c)))
              }
              sizes="200px"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
