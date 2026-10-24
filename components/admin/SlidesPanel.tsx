"use client";

import { categories } from "@/data/categories";
import type { HeroSlide } from "@/data/types";
import { ImageField } from "./ImageField";
import { moveAt, newId, removeAt, SelectInput, SmallButton, TextInput, type ListUpdater } from "./fields";

/** Where a slide's button can point to: the page's sections (no typing URLs). */
const LINKS = [
  { value: "#new-arrivals", label: "New Arrivals" },
  { value: "#shop", label: "Shop All" },
  ...categories.map((c) => ({ value: `#shop-${c.slug}`, label: `Shop: ${c.name}` })),
  { value: "#combos", label: "Combos" },
  { value: "#winter", label: "Winter Rollout" },
  { value: "#reviews", label: "Reviews" },
  { value: "#contact", label: "Visit the Store" },
];

const MAX_SLIDES = 10;

export function SlidesPanel({ slides, onChange }: { slides: HeroSlide[]; onChange: ListUpdater<HeroSlide> }) {
  const update = (id: string, patch: (slide: HeroSlide) => Partial<HeroSlide>) =>
    onChange((list) => list.map((s) => (s.id === id ? { ...s, ...patch(s) } : s)));

  const add = () =>
    onChange((list) => [
      ...list,
      {
        id: newId(),
        eyebrow: "",
        title: "",
        intro: "",
        cta: { label: "Shop Now", href: "#new-arrivals" },
        image: { src: "", alt: "" },
      },
    ]);

  return (
    <section aria-labelledby="slides-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="slides-heading" className="font-display text-lg font-bold uppercase">
            Home page slides
          </h2>
          <p className="text-sm text-muted">The big banners at the top. They change every 3 seconds, in this order.</p>
        </div>
        <SmallButton onClick={add} disabled={slides.length >= MAX_SLIDES}>
          + Add slide
        </SmallButton>
      </div>

      <ol className="mt-5 space-y-4">
        {slides.map((slide, i) => (
          <li key={slide.id} className="rounded-lg bg-ivory p-4 ring-1 ring-line md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-sm font-bold uppercase">Slide {i + 1}</span>
              <div className="flex gap-2">
                <SmallButton onClick={() => onChange((list) => moveAt(list, i, -1))} disabled={i === 0} label="Move slide up">
                  ↑
                </SmallButton>
                <SmallButton
                  onClick={() => onChange((list) => moveAt(list, i, 1))}
                  disabled={i === slides.length - 1}
                  label="Move slide down"
                >
                  ↓
                </SmallButton>
                <SmallButton
                  tone="danger"
                  disabled={slides.length === 1}
                  onClick={() => confirm(`Remove slide ${i + 1}?`) && onChange((list) => removeAt(list, i))}
                >
                  Remove
                </SmallButton>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[minmax(0,320px)_1fr]">
              <ImageField
                src={slide.image.src}
                onChange={(src) => update(slide.id, () => ({ image: { src, alt: "" } }))}
                aspect="2/1"
                sizes="320px"
                hint="Wide (landscape) photos work best."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Heading"
                  value={slide.title}
                  onChange={(title) => update(slide.id, () => ({ title }))}
                  placeholder="e.g. Street Ready."
                  maxLength={60}
                />
                <TextInput
                  label="Small heading (optional)"
                  value={slide.eyebrow}
                  onChange={(eyebrow) => update(slide.id, () => ({ eyebrow }))}
                  placeholder="e.g. New Drop · Winter '26"
                  maxLength={50}
                />
                <TextInput
                  label="Text (optional)"
                  className="sm:col-span-2"
                  multiline
                  value={slide.intro}
                  onChange={(intro) => update(slide.id, () => ({ intro }))}
                  maxLength={200}
                />
                <TextInput
                  label="Button text"
                  value={slide.cta.label}
                  onChange={(label) => update(slide.id, (s) => ({ cta: { ...s.cta, label } }))}
                  maxLength={30}
                />
                <SelectInput
                  label="Button opens"
                  value={slide.cta.href}
                  onChange={(href) => update(slide.id, (s) => ({ cta: { ...s.cta, href } }))}
                  options={LINKS.some((l) => l.value === slide.cta.href) ? LINKS : [{ value: slide.cta.href, label: slide.cta.href }, ...LINKS]}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
