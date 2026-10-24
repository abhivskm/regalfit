"use client";

import { useState } from "react";
import { categories } from "@/data/categories";
import type { CategorySlug, Product, ProductTag } from "@/data/types";
import { discountPercent } from "@/lib/commerce";
import { ImageField } from "./ImageField";
import { Checkbox, newId, PriceInput, SelectInput, SmallButton, TextInput, type ListUpdater } from "./fields";

const CATEGORY_OPTIONS = categories.map((c) => ({ value: c.slug, label: c.name }));

export function ProductsPanel({ products, onChange }: { products: Product[]; onChange: ListUpdater<Product> }) {
  const [filter, setFilter] = useState<"all" | CategorySlug>("all");
  const [query, setQuery] = useState("");

  const update = (id: string, patch: (product: Product) => Partial<Product>) =>
    onChange((list) => list.map((p) => (p.id === id ? { ...p, ...patch(p) } : p)));
  const set = (id: string, patch: Partial<Product>) => update(id, () => patch);
  const remove = (product: Product) =>
    confirm(`Remove "${product.name || "this product"}"?`) && onChange((list) => list.filter((p) => p.id !== product.id));
  const toggleTag = (id: string, tag: ProductTag, on: boolean) =>
    update(id, (p) => ({ tags: on ? [...p.tags.filter((t) => t !== tag), tag] : p.tags.filter((t) => t !== tag) }));

  // New products go to the top of the list, so they appear first on the website.
  const add = () => {
    setQuery("");
    onChange((list) => [
      {
        id: newId(),
        name: "",
        category: filter === "all" ? "oversized-tees" : filter,
        price: 0,
        mrp: 0,
        tags: ["new"],
        image: { src: "", alt: "" },
      },
      ...list,
    ]);
  };

  const q = query.trim().toLowerCase();
  const visible = products.filter(
    (p) => (filter === "all" || p.category === filter) && (!q || p.name.toLowerCase().includes(q)),
  );

  return (
    <section aria-labelledby="products-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="products-heading" className="font-display text-lg font-bold uppercase">
            Products ({products.length})
          </h2>
          <p className="text-sm text-muted">Set prices, change photos, add or remove products.</p>
        </div>
        <SmallButton onClick={add}>+ Add product</SmallButton>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <TextInput label="Search" value={query} onChange={setQuery} placeholder="Type a product name" />
        <SelectInput
          label="Category"
          value={filter}
          onChange={setFilter}
          options={[{ value: "all" as const, label: "All categories" }, ...CATEGORY_OPTIONS]}
        />
      </div>

      {visible.length === 0 && <p className="mt-8 text-center text-sm text-muted">No products match.</p>}

      <ul className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {visible.map((product) => {
          const valid = product.price > 0 && product.mrp > 0;
          const tooHigh = valid && product.price > product.mrp;
          return (
            <li key={product.id} className="flex gap-4 rounded-lg bg-ivory p-4 ring-1 ring-line">
              <div className="w-28 shrink-0 sm:w-32">
                <ImageField
                  src={product.image.src}
                  onChange={(src) => set(product.id, { image: { src, alt: "" } })}
                  sizes="128px"
                />
              </div>
              <div className="grid min-w-0 flex-1 gap-3">
                <TextInput
                  label="Name"
                  value={product.name}
                  onChange={(name) => set(product.id, { name })}
                  placeholder="e.g. Black Oversized Tee"
                  maxLength={80}
                />
                <SelectInput
                  label="Category"
                  value={product.category}
                  onChange={(category) => set(product.id, { category })}
                  options={CATEGORY_OPTIONS}
                />
                <div className="grid grid-cols-2 gap-3">
                  <PriceInput label="Price" value={product.price} onChange={(price) => set(product.id, { price })} />
                  <PriceInput label="MRP" value={product.mrp} onChange={(mrp) => set(product.id, { mrp })} />
                </div>
                <p className={`text-xs font-semibold ${tooHigh ? "text-red-700" : "text-sale"}`}>
                  {tooHigh ? "Price is more than MRP" : valid ? `${discountPercent(product.price, product.mrp)}% OFF` : " "}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <Checkbox
                    label="New"
                    checked={product.tags.includes("new")}
                    onChange={(on) => toggleTag(product.id, "new", on)}
                  />
                  <Checkbox
                    label="Bestseller"
                    checked={product.tags.includes("bestseller")}
                    onChange={(on) => toggleTag(product.id, "bestseller", on)}
                  />
                  <span className="ml-auto">
                    <SmallButton tone="danger" onClick={() => remove(product)}>
                      Remove
                    </SmallButton>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
