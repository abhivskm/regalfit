import { isAdmin } from "@/lib/admin-auth";
import { getTrackingSnapshot, RANGES, type Range } from "@/lib/analytics";
import { dbConfigured } from "@/lib/db";

/** Polled by the tracking page every few seconds while it is open. Admins only. */
export async function GET(request: Request): Promise<Response> {
  if (!(await isAdmin())) return new Response("Please log in.", { status: 401 });
  if (!dbConfigured()) return new Response("Database not connected.", { status: 503 });

  const requested = new URL(request.url).searchParams.get("range");
  const range: Range = RANGES.some((r) => r.value === requested) ? (requested as Range) : "7d";
  return Response.json(await getTrackingSnapshot(range), { headers: { "cache-control": "no-store" } });
}
