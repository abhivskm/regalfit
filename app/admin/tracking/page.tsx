import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TrackingDashboard } from "@/components/admin/TrackingDashboard";
import { isAdmin } from "@/lib/admin-auth";
import { compactOldData, getDashboard, getLiveData, listEnquiries, RANGES, type Range } from "@/lib/analytics";
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
  const [dashboard, live, enquiries, content] = await Promise.all([
    getDashboard(range),
    getLiveData(),
    listEnquiries(),
    readContent(),
  ]);

  // Show every current product (even with no activity yet), plus removed ones that still have data.
  const stats = new Map(dashboard.products.map((p) => [p.id, p]));
  const products = [
    ...content.products.map((p) => ({ id: p.id, label: p.name, views: 0, whatsapp: 0, ...stats.get(p.id), current: true })),
    ...dashboard.products
      .filter((p) => !content.products.some((c) => c.id === p.id))
      .map((p) => ({ ...p, current: false })),
  ].map((p) => ({ ...p, label: content.products.find((c) => c.id === p.id)?.name ?? p.label }));

  return <TrackingDashboard dashboard={{ ...dashboard, products }} initialLive={live} enquiries={enquiries} />;
}
