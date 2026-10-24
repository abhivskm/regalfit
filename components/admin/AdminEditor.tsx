"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { logout, saveContent } from "@/app/admin/actions";
import type { SiteContent } from "@/lib/content";
import { CategoriesPanel } from "./CategoriesPanel";
import { CombosPanel } from "./CombosPanel";
import { UploadTracker } from "./fields";
import { ProductsPanel } from "./ProductsPanel";
import { SlidesPanel } from "./SlidesPanel";

type Tab = "products" | "slides" | "combos" | "categories";
const TABS: { id: Tab; label: string }[] = [
  { id: "products", label: "Products & prices" },
  { id: "slides", label: "Slides" },
  { id: "combos", label: "Combos" },
  { id: "categories", label: "Category photos" },
];

type Status = { tone: "success" | "error"; message: string } | null;

/**
 * The admin portal. Edits are kept in the browser until "Save changes", which validates
 * everything on the server, stores it and refreshes the live website in one step.
 */
export function AdminEditor({ initialContent, storageReady }: { initialContent: SiteContent; storageReady: boolean }) {
  const [content, setContent] = useState(initialContent);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
  const [tab, setTab] = useState<Tab>("products");
  const [status, setStatus] = useState<Status>(null);
  const [uploading, setUploading] = useState(0);
  const [saving, startSaving] = useTransition();

  const dirty = useMemo(() => JSON.stringify(content) !== savedJson, [content, savedJson]);
  const tracker = useMemo(
    () => ({ begin: () => setUploading((n) => n + 1), end: () => setUploading((n) => Math.max(0, n - 1)) }),
    [],
  );

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Panels pass an updater (old list -> new list) so edits that finish later, like photo
  // uploads, always apply to the latest content instead of overwriting other changes.
  const edit =
    <K extends keyof SiteContent>(key: K) =>
    (update: (current: SiteContent[K]) => SiteContent[K]) => {
      setStatus(null);
      setContent((c) => ({ ...c, [key]: update(c[key]) }));
    };

  const save = () =>
    startSaving(async () => {
      const result = await saveContent(content);
      if (result.ok) {
        setContent(result.content);
        setSavedJson(JSON.stringify(result.content));
        setStatus({ tone: "success", message: "Saved! The website now shows your changes." });
      } else {
        setStatus({ tone: "error", message: result.error });
      }
    });

  const discard = () => {
    if (!confirm("Discard all changes since your last save?")) return;
    setContent(JSON.parse(savedJson) as SiteContent);
    setStatus(null);
  };

  return (
    <UploadTracker.Provider value={tracker}>
      <header className="sticky top-0 z-40 border-b border-line bg-ivory">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:px-6">
          <Image src="/images/brand/monogram-gold.png" alt="" width={74} height={80} unoptimized className="h-8 w-auto" />
          <span className="font-display text-sm font-bold uppercase tracking-wide">Regal Fit Admin</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs font-semibold underline-offset-4 hover:underline"
          >
            View website ↗
          </a>
          <form action={logout}>
            <button type="submit" className="rounded-md border border-line px-3 py-2 text-xs font-semibold hover:border-ink">
              Log out
            </button>
          </form>
        </div>
        <nav aria-label="Admin sections" className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 scrollbar-none md:px-6 [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={tab === t.id ? "page" : undefined}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-[1600px] px-4 pb-32 pt-6 md:px-6">
        {!storageReady && (
          <p role="alert" className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
            Photo storage is not connected, so changes can&apos;t be saved yet. Connect a Vercel Blob store to this project.
          </p>
        )}
        {tab === "products" && <ProductsPanel products={content.products} onChange={edit("products")} />}
        {tab === "slides" && <SlidesPanel slides={content.heroSlides} onChange={edit("heroSlides")} />}
        {tab === "combos" && <CombosPanel combos={content.combos} onChange={edit("combos")} />}
        {tab === "categories" && <CategoriesPanel categories={content.categories} onChange={edit("categories")} />}
      </main>

      {/* Save bar: always visible, highlighted when there are unsaved changes. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t transition-colors ${
          dirty ? "border-gold bg-ink text-ivory" : "border-line bg-ivory text-ink"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <p aria-live="polite" className="mr-auto text-sm">
            {uploading > 0
              ? "Uploading photo… please wait."
              : status
                ? <span className={status.tone === "error" ? (dirty ? "text-red-300" : "text-red-700") : dirty ? "text-gold" : "text-sale"}>{status.message}</span>
                : dirty
                  ? "You have unsaved changes."
                  : "All changes saved."}
          </p>
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || saving}
            className="rounded-md border border-current px-4 py-2.5 text-xs font-semibold disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || uploading > 0 || !storageReady}
            className="rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </UploadTracker.Provider>
  );
}
