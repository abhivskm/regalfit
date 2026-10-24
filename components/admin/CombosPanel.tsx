"use client";

import type { Combo } from "@/data/types";
import { discountPercent } from "@/lib/commerce";
import { ImageField } from "./ImageField";
import { newId, PriceInput, SmallButton, TextInput, type ListUpdater } from "./fields";

const MAX_COMBOS = 12;

export function CombosPanel({ combos, onChange }: { combos: Combo[]; onChange: ListUpdater<Combo> }) {
  const set = (id: string, patch: Partial<Combo>) =>
    onChange((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const add = () =>
    onChange((list) => [...list, { id: newId(), title: "", detail: "", price: 0, mrp: 0, image: { src: "", alt: "" } }]);

  return (
    <section aria-labelledby="combos-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="combos-heading" className="font-display text-lg font-bold uppercase">
            Combo deals
          </h2>
          <p className="text-sm text-muted">Bundle offers shown in the &ldquo;Combos&rdquo; section.</p>
        </div>
        <SmallButton onClick={add} disabled={combos.length >= MAX_COMBOS}>
          + Add combo
        </SmallButton>
      </div>

      {combos.length === 0 && <p className="mt-8 text-center text-sm text-muted">No combos. The section is hidden.</p>}

      <ul className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {combos.map((combo) => {
          const valid = combo.price > 0 && combo.mrp > 0;
          return (
            <li key={combo.id} className="flex gap-4 rounded-lg bg-ivory p-4 ring-1 ring-line">
              <div className="w-28 shrink-0 sm:w-32">
                <ImageField src={combo.image.src} onChange={(src) => set(combo.id, { image: { src, alt: "" } })} aspect="4/5" sizes="128px" />
              </div>
              <div className="grid min-w-0 flex-1 gap-3">
                <TextInput
                  label="Name"
                  value={combo.title}
                  onChange={(title) => set(combo.id, { title })}
                  placeholder="e.g. Any 3 Oversized Tees"
                  maxLength={40}
                />
                <TextInput
                  label="Short line (optional)"
                  value={combo.detail}
                  onChange={(detail) => set(combo.id, { detail })}
                  placeholder="e.g. Mix colours and prints"
                  maxLength={60}
                />
                <div className="grid grid-cols-2 gap-3">
                  <PriceInput label="Combo price" value={combo.price} onChange={(price) => set(combo.id, { price })} />
                  <PriceInput label="MRP" value={combo.mrp} onChange={(mrp) => set(combo.id, { mrp })} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${valid && combo.price > combo.mrp ? "text-red-700" : "text-sale"}`}>
                    {valid ? (combo.price > combo.mrp ? "Price is more than MRP" : `Save ${discountPercent(combo.price, combo.mrp)}%`) : ""}
                  </span>
                  <SmallButton
                    tone="danger"
                    onClick={() =>
                      confirm(`Remove "${combo.title || "this combo"}"?`) &&
                      onChange((list) => list.filter((c) => c.id !== combo.id))
                    }
                  >
                    Remove
                  </SmallButton>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
