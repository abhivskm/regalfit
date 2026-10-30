"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { setEnquiryStatus } from "@/app/admin/tracking/actions";
import type { EnquiryStatus, TrackingSnapshot } from "@/lib/analytics";
import { RANGES } from "@/lib/analytics-ranges";
import { AdminTopBar } from "./AdminTopBar";

type Props = {
  initial: TrackingSnapshot;
  catalog: { id: string; name: string }[];
};

const POLL_MS = 5000;

const EVENT_TEXT: Record<string, string> = {
  pageview: "Visited the website",
  whatsapp: "WhatsApp click on product",
  combo: "WhatsApp click on combo",
  whatsapp_general: "Opened WhatsApp chat",
  call: "Tapped Call",
  category: "Opened category",
  slide: "Clicked slide button",
  directions: "Opened directions",
  enquiry: "Sent an enquiry",
};
const EVENT_ICON: Record<string, string> = {
  pageview: "👀",
  whatsapp: "🟢",
  combo: "🟢",
  whatsapp_general: "💬",
  call: "📞",
  category: "🗂️",
  slide: "🖼️",
  directions: "📍",
  enquiry: "✉️",
};
const SOURCE_NAME: Record<string, string> = {
  direct: "Direct / typed link",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google",
  whatsapp: "WhatsApp",
  youtube: "YouTube",
};
const sourceName = (s: string | null) => (s ? (SOURCE_NAME[s] ?? s) : "Unknown");

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

const percent = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : "—");

/* ---------- small building blocks ---------- */

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg bg-ivory p-4 ring-1 ring-line md:p-5 ${className}`}>
      <h2 className="font-display text-sm font-bold uppercase tracking-wide">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg bg-ivory p-4 ring-1 ring-line">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Horizontal bars for "top N" lists. */
function BarList({ rows, empty = "No data yet." }: { rows: { key: string; count: number }[]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key} className="relative overflow-hidden rounded bg-stone px-3 py-2 text-sm">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-gold/35" style={{ width: `${(r.count / max) * 100}%` }} />
          <span className="relative flex justify-between gap-3">
            <span className="truncate">{r.key}</span>
            <span className="font-semibold tabular-nums">{r.count}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- the page ---------- */

export function TrackingDashboard({ initial, catalog }: Props) {
  const [snapshot, setSnapshot] = useState(initial);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [offline, setOffline] = useState(false);
  const statusVersion = useRef(0);
  const [productSort, setProductSort] = useState<"whatsapp" | "views">("whatsapp");
  const [, startTransition] = useTransition();
  const { dashboard, live, enquiries } = snapshot;
  const { totals, range } = dashboard;

  // The whole page refreshes on its own while it is open and on screen.
  useEffect(() => {
    const controller = new AbortController();
    let polling = false;
    const poll = async () => {
      if (polling || document.visibilityState !== "visible") return;
      polling = true;
      const version = statusVersion.current;
      try {
        const response = await fetch(`/api/admin/tracking?range=${range}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`Tracking refresh failed: ${response.status}`);
        const next: TrackingSnapshot = await response.json();
        // A status changed while this was loading: keep what the admin just picked.
        const keepEnquiries = statusVersion.current !== version;
        setSnapshot((current) => (keepEnquiries ? { ...next, enquiries: current.enquiries } : next));
        setUpdatedAt(new Date());
        setOffline(false);
      } catch {
        if (!controller.signal.aborted) setOffline(true);
      } finally {
        polling = false;
      }
    };
    const timer = window.setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [range]);

  const changeStatus = (id: number, status: EnquiryStatus) => {
    statusVersion.current += 1;
    setSnapshot((current) => ({
      ...current,
      enquiries: current.enquiries.map((e) => (e.id === id ? { ...e, status } : e)),
    }));
    startTransition(async () => {
      await setEnquiryStatus(id, status);
      statusVersion.current += 1;
    });
  };

  // Show every current product (even with no activity yet), plus removed ones that still have data.
  const stats = new Map(dashboard.products.map((p) => [p.id, p]));
  const products = [
    ...catalog.map((c) => ({ views: 0, whatsapp: 0, ...stats.get(c.id), id: c.id, label: c.name, current: true })),
    ...dashboard.products.filter((p) => !catalog.some((c) => c.id === p.id)).map((p) => ({ ...p, current: false })),
  ].sort((a, b) => b[productSort] - a[productSort] || b.views - a.views);
  const maxVisits = Math.max(1, ...dashboard.series.map((s) => s.visits));
  const newCount = enquiries.filter((e) => e.status === "new").length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ivory">
        <AdminTopBar active="tracking" />
      </header>

      <main id="main" className="mx-auto max-w-[1600px] space-y-5 px-4 pb-16 pt-6 md:px-6">
        {/* Range switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold uppercase">Website tracking</h1>
          <nav aria-label="Date range" className="flex gap-1 rounded-md bg-ivory p-1 ring-1 ring-line">
            {RANGES.map((r) => (
              <Link
                key={r.value}
                href={`/admin/tracking?range=${r.value}`}
                aria-current={dashboard.range === r.value ? "page" : undefined}
                className={`rounded px-3 py-1.5 text-xs font-semibold ${
                  dashboard.range === r.value ? "bg-ink text-ivory" : "text-muted hover:text-ink"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Live + totals */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-lg bg-ink p-4 text-ivory sm:col-span-2 lg:col-span-1">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
              </span>
              Live now
            </p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums" aria-live="polite">
              {live.liveNow}
            </p>
            <p className="mt-1 text-xs text-ivory/70">
              {live.liveDevices.map((d) => `${d.count} ${d.key}`).join(" · ") || "No one right now"}
            </p>
            <p className="mt-2 text-[11px] text-ivory/50" suppressHydrationWarning>
              {offline ? "Connection problem, retrying · last updated " : "Updated "}
              {updatedAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
              {offline ? "" : " · every 5 s"}
            </p>
          </div>
          <Stat label="Visits" value={totals.visits} />
          <Stat
            label="Visitors"
            value={totals.visitors}
            hint={`${totals.newVisitors} new · ${Math.max(0, totals.visitors - totals.newVisitors)} returning`}
          />
          <Stat label="WhatsApp clicks" value={totals.whatsapp} hint={percent(totals.whatsapp, totals.visitors) + " of visitors"} />
          <Stat label="Call clicks" value={totals.calls} />
          <Stat label="Enquiries" value={totals.enquiries} hint={newCount ? `${newCount} waiting for reply` : "All handled"} />
        </div>

        {/* Visits over time */}
        <Card title={dashboard.range === "today" ? "Visits today, by hour" : "Visits per day"}>
          <div className="flex h-44 items-end gap-1" role="img" aria-label="Visits chart (exact numbers in the table below)">
            {dashboard.series.map((s) => (
              <div key={s.label} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className="rounded-t bg-ink/80 transition-colors group-hover:bg-gold"
                  style={{ height: `${(s.visits / maxVisits) * 100}%`, minHeight: s.visits ? 3 : 0 }}
                />
                <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-ivory group-hover:block">
                  {s.label}: {s.visits}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>{dashboard.series[0]?.label}</span>
            <span>{dashboard.series.at(-1)?.label}</span>
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-muted">Show as table</summary>
            <table className="mt-2 w-full max-w-sm text-left text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="py-1">{dashboard.range === "today" ? "Hour" : "Day"}</th>
                  <th className="py-1">Visits</th>
                  <th className="py-1">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.series.map((s) => (
                  <tr key={s.label} className="border-t border-line">
                    <td className="py-1">{s.label}</td>
                    <td className="py-1 tabular-nums">{s.visits}</td>
                    <td className="py-1 tabular-nums">{s.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </Card>

        <div className="grid gap-5 xl:grid-cols-3">
          {/* Product-wise */}
          <Card title="Products" className="xl:col-span-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <p>
                <strong className="text-ink">Seen</strong> = shown on a visitor&apos;s screen.{" "}
                <strong className="text-ink">WhatsApp</strong> = &ldquo;Buy on WhatsApp&rdquo; taps.
              </p>
              <label className="flex items-center gap-2">
                Sort by
                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value as "whatsapp" | "views")}
                  className="rounded border border-line bg-ivory px-2 py-1 text-ink"
                >
                  <option value="whatsapp">WhatsApp clicks</option>
                  <option value="views">Most seen</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 font-semibold">Product</th>
                    <th className="py-2 text-right font-semibold">Seen</th>
                    <th className="py-2 text-right font-semibold">WhatsApp</th>
                    <th className="py-2 text-right font-semibold">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const cold = p.views >= 20 && p.whatsapp === 0;
                    return (
                      <tr key={p.id} className="border-b border-line last:border-0">
                        <td className="py-2 pr-3">
                          {p.label}
                          {!p.current && <span className="ml-2 text-xs text-muted">(removed)</span>}
                          {cold && (
                            <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-deep">
                              Seen a lot, no enquiries
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right tabular-nums">{p.views}</td>
                        <td className="py-2 text-right font-semibold tabular-nums">{p.whatsapp}</td>
                        <td className="py-2 text-right tabular-nums text-muted">{percent(p.whatsapp, p.views)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Live activity */}
          <Card title="Live activity">
            {live.recent.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ol className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {live.recent.map((e, i) => (
                  <li key={`${e.ts}-${i}`} className="flex gap-2 rounded bg-stone px-3 py-2 text-sm">
                    <span aria-hidden="true">{EVENT_ICON[e.type] ?? "•"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block">
                        {EVENT_TEXT[e.type] ?? e.type}
                        {e.label && <strong className="font-semibold">: {e.label}</strong>}
                      </span>
                      <span className="block text-xs text-muted" suppressHydrationWarning>
                        {timeAgo(e.ts)} · {e.device ?? "?"} · {sourceName(e.source)}
                        {e.city ? ` · ${e.city}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Where visitors came from">
            <BarList rows={dashboard.sources.map((s) => ({ key: sourceName(s.key), count: s.count }))} />
          </Card>
          <Card title="Cities">
            <BarList rows={dashboard.cities} />
          </Card>
          <Card title="Devices">
            <BarList rows={dashboard.devices} />
          </Card>
          <Card title="Category clicks">
            <BarList rows={dashboard.categories} />
          </Card>
          <Card title="Combo deal clicks">
            <BarList rows={dashboard.combos} />
          </Card>
          <Card title="Slide button clicks">
            <BarList rows={dashboard.slides} />
          </Card>
        </div>

        {/* Enquiries */}
        <Card title={`Enquiries from the contact form (${enquiries.length})`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">Mark each enquiry once you have replied. Newest first.</p>
            <a
              href="/api/admin/enquiries"
              className="rounded-md border border-ink px-3 py-2 text-xs font-semibold hover:bg-ink hover:text-ivory"
            >
              Download Excel (CSV)
            </a>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted">No enquiries yet.</p>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {enquiries.map((e) => {
                const digits = e.phone?.replace(/\D/g, "") ?? "";
                const waNumber = digits.length === 10 ? `91${digits}` : digits;
                return (
                  <li
                    key={e.id}
                    className={`rounded-lg p-4 ring-1 ${e.status === "new" ? "bg-gold/10 ring-gold" : "bg-stone ring-line"}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{e.name}</p>
                        <p className="text-xs text-muted" suppressHydrationWarning>
                          {timeAgo(e.createdAt)} · via {sourceName(e.source)}
                        </p>
                      </div>
                      <select
                        value={e.status}
                        onChange={(ev) => changeStatus(e.id, ev.target.value as EnquiryStatus)}
                        aria-label={`Status of enquiry from ${e.name}`}
                        className="rounded border border-line bg-ivory px-2 py-1 text-xs font-semibold"
                      >
                        <option value="new">🟡 New</option>
                        <option value="contacted">🔵 Contacted</option>
                        <option value="done">✅ Done</option>
                      </select>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm">{e.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <a href={`mailto:${e.email}`} className="rounded border border-line bg-ivory px-2 py-1 hover:border-ink">
                        ✉️ {e.email}
                      </a>
                      {e.phone && (
                        <>
                          <a href={`tel:${e.phone}`} className="rounded border border-line bg-ivory px-2 py-1 hover:border-ink">
                            📞 {e.phone}
                          </a>
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded border border-line bg-ivory px-2 py-1 hover:border-ink"
                          >
                            💬 WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <p className="text-xs text-muted">
          Counts exclude your own visits while logged in, and search-engine bots. Detailed activity is kept for 90
          days; daily totals are kept permanently.
        </p>
      </main>
    </>
  );
}
