import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TrackingDashboard } from "@/components/admin/TrackingDashboard";
import { isAdmin } from "@/lib/admin-auth";
import { compactOldData, getTrackingSnapshot, RANGES, type Range } from "@/lib/analytics";
import { readContent } from "@/lib/content";
import { dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Tracking" };

export default function TrackingPage(props: PageProps<"/admin/tracking">) {
  return (
    // Login and live numbers are per request, so everything sits inside Suspense (Cache Components).
    <Suspense fallback={<p className="p-10 text-center text-sm text-muted">Loading tracking…</p>}>
      <TrackingGate searchParams={props.searchParams} />
    </Suspense>
  );
}

async function TrackingGate({ searchParams }: { searchParams: PageProps<"/admin/tracking">["searchParams"] }) {
  if (!(await isAdmin())) redirect("/admin/login");
  if (!dbConfigured()) {
    return <p className="p-10 text-center text-sm text-red-700">The tracking database is not connected (DATABASE_URL is missing).</p>;
  }

  const requested = (await searchParams).range;
  const range: Range = RANGES.some((r) => r.value === requested) ? (requested as Range) : "7d";

  await compactOldData();
  const [snapshot, content] = await Promise.all([getTrackingSnapshot(range), readContent()]);

  // Numbers refresh on their own in the browser; the key starts fresh when the range changes.
  return <TrackingDashboard key={range} initial={snapshot} catalog={content.products.map((p) => ({ id: p.id, name: p.name }))} />;
}
