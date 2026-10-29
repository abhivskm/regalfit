import { isAdmin } from "@/lib/admin-auth";
import { EVENT_TYPES, recordEvents, type EventType, type TrackedEvent } from "@/lib/analytics";
import { dbConfigured } from "@/lib/db";
import { visitFrom } from "@/lib/visit";

const MAX_EVENTS = 30;
const MAX_BODY = 8 * 1024;

/**
 * Receives batched visitor activity from components/Tracker.tsx (sent with sendBeacon).
 * Always answers 204 so tracking can never break the page; bad or bot traffic is dropped.
 */
export async function POST(request: Request): Promise<Response> {
  const done = new Response(null, { status: 204 });
  if (!dbConfigured()) return done;

  const raw = await request.text();
  if (raw.length > MAX_BODY) return done;
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return done;
  }

  const visit = visitFrom({ visitor: body.v, session: body.s, isNew: body.n, source: body.src }, request.headers);
  // The shop's own visits (logged-in admin) are not counted.
  if (!visit || (await isAdmin())) return done;

  const events: TrackedEvent[] = (Array.isArray(body.e) ? body.e : [])
    .slice(0, MAX_EVENTS)
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    // "enquiry" is only recorded by the server when a form is really saved.
    .filter((e) => EVENT_TYPES.includes(e.type as EventType) && e.type !== "enquiry")
    .map((e) => ({
      type: e.type as EventType,
      item: typeof e.item === "string" ? e.item.slice(0, 64) : undefined,
      label: typeof e.label === "string" ? e.label.slice(0, 100) : undefined,
    }));

  try {
    await recordEvents(visit, events);
  } catch (error) {
    console.error("Tracking write failed:", error);
  }
  return done;
}
