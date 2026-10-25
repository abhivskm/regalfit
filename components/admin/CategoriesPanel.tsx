"use client";

import { useState } from "react";
import type { Category, Product } from "@/data/types";
import { ImageField } from "./ImageField";
import { moveAt, SmallButton, TextInput, type ListUpdater } from "./fields";

const MAX_CATEGORIES = 24;

/** "Oversized Tees" → "oversized-tees". */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

/** A slug not used by any existing category (adds -2, -3… if needed). */
function uniqueSlug(name: string, taken: string[]): string {
  const base = slugify(name) || "category";
  let slug = base;
  for (let n = 2; taken.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function CategoriesPanel({
  categories,
  products,
  onChange,
}: {
  categories: Category[];
  products: Product[];
  onChange: ListUpdater<Category>;
}) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  const countIn = (slug: string) => products.filter((p) => p.category === slug).length;
  const rename = (slug: string, name: string) =>
    onChange((list) => list.map((c) => (c.slug === slug ? { ...c, name } : c)));

  const add = () => {
    const name = newName.trim();
    if (!name) return setError("Type a name for the new category.");
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return setError(`"${name}" already exists.`);
    }
    setError("");
    setNewName("");
    // The ID is made once from the name and never changes, so renaming later keeps all links working.
    onChange((list) => [...list, { slug: uniqueSlug(name, list.map((c) => c.slug)), name, image: { src: "", alt: "" } }]);
  };

  const remove = (category: Category) => {
    const count = countIn(category.slug);
    if (count > 0) {
      alert(
        `"${category.name}" still has ${count} product${count === 1 ? "" : "s"}. ` +
          `Move them to another category (or remove them) in "Products & prices" first.`,
      );
      return;
    }
    if (confirm(`Remove the "${category.name}" category?`)) {
      onChange((list) => list.filter((c) => c.slug !== category.slug));
    }
  };

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="font-display text-lg font-bold uppercase">
        Categories ({categories.length})
      </h2>
      <p className="text-sm text-muted">
        Shown in &ldquo;Shop by Category&rdquo;, the Shop All filter, the menu and the footer, in this order.
      </p>

      {/* Add a category */}
      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-lg bg-ivory p-4 ring-1 ring-line">
        <div className="min-w-56 flex-1">
          <TextInput
            label="New category name"
            value={newName}
            onChange={(v) => {
              setNewName(v);
              setError("");
            }}
            placeholder="e.g. Kurtas"
            maxLength={30}
          />
        </div>
        <SmallButton onClick={add} disabled={categories.length >= MAX_CATEGORIES}>
          + Add category
        </SmallButton>
        {error && (
          <p role="alert" className="w-full text-sm text-red-700">
            {error}
          </p>
        )}
        <p className="w-full text-xs text-muted">After adding, upload its photo below, then click Save changes.</p>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category, i) => {
          const count = countIn(category.slug);
          return (
            <li key={category.slug} className="flex flex-col gap-3 rounded-lg bg-ivory p-3 ring-1 ring-line">
              <TextInput
                label="Name"
                value={category.name}
                onChange={(name) => rename(category.slug, name)}
                maxLength={30}
              />
              <ImageField
                src={category.image.src}
                onChange={(src) =>
                  onChange((list) => list.map((c) => (c.slug === category.slug ? { ...c, image: { src, alt: "" } } : c)))
                }
                sizes="200px"
              />
              <p className="text-xs text-muted">
                {count} product{count === 1 ? "" : "s"}
              </p>
              <div className="mt-auto flex gap-2">
                <SmallButton onClick={() => onChange((list) => moveAt(list, i, -1))} disabled={i === 0} label="Move left">
                  ←
                </SmallButton>
                <SmallButton
                  onClick={() => onChange((list) => moveAt(list, i, 1))}
                  disabled={i === categories.length - 1}
                  label="Move right"
                >
                  →
                </SmallButton>
                <SmallButton tone="danger" onClick={() => remove(category)} disabled={categories.length === 1}>
                  Remove
                </SmallButton>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
