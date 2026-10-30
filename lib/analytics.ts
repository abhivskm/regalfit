import { RANGES, type Range } from "./analytics-ranges";
import { sql } from "./db";

/* ------------------------------------------------------------------
   Event types — anything else sent to /api/track is ignored
   ------------------------------------------------------------------ */
export const EVENT_TYPES = [
  "pageview",
  "product_view",
  "whatsapp", // "Buy on WhatsApp" on a product
  "combo", // "Grab deal" on a combo
  "whatsapp_general", // header / contact "WhatsApp" buttons
  "call",
  "category",
  "slide",
  "directions",
  "enquiry", // contact form sent (recorded on the server)
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type TrackedEvent = { type: EventType; item?: string; label?: string };

export type Visit = {
  visitor: string;
  session: string;
  isNew: boolean;
  source: string;
  device: string;
  city: string | null;
  region: string | null;
  country: string | null;
};

const TZ = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = 90;

/* ------------------------------------------------------------------
   Writing
   ------------------------------------------------------------------ */

export async function recordEvents(visit: Visit, events: TrackedEvent[], left = false): Promise<void> {
  const db = sql();
  const queries = [];
  if (events.length) {
    queries.push(db`
      INSERT INTO events (visitor, session, type, item, label, source, device, city, region, country, is_new)
      SELECT ${visit.visitor}, ${visit.session}, e.type, e.item, e.label,
             ${visit.source}, ${visit.device}, ${visit.city}, ${visit.region}, ${visit.country},
             (e.type = 'pageview' AND ${visit.isNew})
      FROM unnest(${events.map((e) => e.type)}::text[],
                  ${events.map((e) => e.item ?? null)}::text[],
                  ${events.map((e) => e.label ?? null)}::text[]) AS e(type, item, label)`);
  }
  // Heartbeat for the "live now" counter (a visitor who just left drops off at once).
  queries.push(
    left
      ? db`DELETE FROM presence WHERE visitor = ${visit.visitor}`
      : db`
    INSERT INTO presence (visitor, last_seen, device, source)
    VALUES (${visit.visitor}, now(), ${visit.device}, ${visit.source})
    ON CONFLICT (visitor) DO UPDATE SET last_seen = now(), device = EXCLUDED.device, source = EXCLUDED.source`,
  );
  await db.transaction(queries);
}

/* ------------------------------------------------------------------
   Enquiries (contact form)
   ------------------------------------------------------------------ */

export type EnquiryStatus = "new" | "contacted" | "done";
export const ENQUIRY_STATUSES: EnquiryStatus[] = ["new", "contacted", "done"];

export type Enquiry = {
  id: number;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: EnquiryStatus;
  source: string | null;
};

export async function saveEnquiry(
  enquiry: { name: string; email: string; phone: string | null; message: string },
  visit: Visit | null,
): Promise<void> {
  const db = sql();
  await db.transaction([
    db`INSERT INTO enquiries (name, email, phone, message, source, visitor)
       VALUES (${enquiry.name}, ${enquiry.email}, ${enquiry.phone}, ${enquiry.message},
               ${visit?.source ?? null}, ${visit?.visitor ?? null})`,
    ...(visit
      ? [db`INSERT INTO events (visitor, session, type, label, source, device, city, region, country)
            VALUES (${visit.visitor}, ${visit.session}, 'enquiry', ${enquiry.name}, ${visit.source},
                    ${visit.device}, ${visit.city}, ${visit.region}, ${visit.country})`]
      : []),
  ]);
}

export async function listEnquiries(limit = 200): Promise<Enquiry[]> {
  const rows = await sql()`
    SELECT id, created_at, name, email, phone, message, status, source
    FROM enquiries ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map((r) => ({
    id: Number(r.id),
    createdAt: new Date(r.created_at).toISOString(),
    name: r.name,
    email: r.email,
    phone: r.phone,
    message: r.message,
    status: r.status,
    source: r.source,
  }));
}

export async function updateEnquiryStatus(id: number, status: EnquiryStatus): Promise<void> {
  await sql()`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
}

/* ------------------------------------------------------------------
   Dashboard
   ------------------------------------------------------------------ */

export { RANGES, type Range } from "./analytics-ranges";

/** Start of the range: midnight India time, `days - 1` days ago. */
function rangeStart(range: Range): Date {
  const days = RANGES.find((r) => r.value === range)?.days ?? 7;
  const midnightIst = Math.floor((Date.now() + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS;
  return new Date(midnightIst - (days - 1) * DAY_MS);
}

type Count = { key: string; count: number };
const counts = (rows: Record<string, unknown>[]): Count[] =>
  rows.map((r) => ({ key: String(r.key ?? "unknown"), count: Number(r.count) }));

export type Dashboard = {
  range: Range;
  totals: {
    visits: number;
    visitors: number;
    newVisitors: number;
    whatsapp: number;
    calls: number;
    enquiries: number;
  };
  /** Visits per hour (today) or per day (other ranges), oldest first. */
  series: { label: string; visits: number; visitors: number }[];
  products: { id: string; label: string; views: number; whatsapp: number }[];
  combos: Count[];
  categories: Count[];
  slides: Count[];
  sources: Count[];
  devices: Count[];
  cities: Count[];
};

export async function getDashboard(range: Range): Promise<Dashboard> {
  const db = sql();
  const since = rangeStart(range);
  const hourly = range === "today";

  const [totals, series, products, clicks, sources, devices, cities, enquiries] = await db.transaction([
    db`SELECT
         count(*) FILTER (WHERE type = 'pageview')                         AS visits,
         count(DISTINCT visitor) FILTER (WHERE type = 'pageview')          AS visitors,
         count(DISTINCT visitor) FILTER (WHERE type = 'pageview' AND is_new) AS new_visitors,
         count(*) FILTER (WHERE type IN ('whatsapp', 'combo', 'whatsapp_general')) AS whatsapp,
         count(*) FILTER (WHERE type = 'call')                             AS calls
       FROM events WHERE ts >= ${since}`,
    hourly
      ? db`SELECT extract(hour FROM ts AT TIME ZONE ${TZ})::int AS bucket,
                  count(*) AS visits, count(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1`
      : db`SELECT to_char(ts AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS bucket,
                  count(*) AS visits, count(DISTINCT visitor) AS visitors
           FROM events WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1`,
    db`SELECT item,
              max(label) AS label,
              count(*) FILTER (WHERE type = 'product_view') AS views,
              count(*) FILTER (WHERE type = 'whatsapp')     AS whatsapp
       FROM events WHERE type IN ('product_view', 'whatsapp') AND item IS NOT NULL AND ts >= ${since}
       GROUP BY item`,
    db`SELECT type, coalesce(max(label), item) AS key, count(*) AS count
       FROM events WHERE type IN ('combo', 'category', 'slide') AND ts >= ${since}
       GROUP BY type, item ORDER BY count DESC`,
    db`SELECT source AS key, count(DISTINCT visitor) AS count FROM events
       WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    db`SELECT device AS key, count(DISTINCT visitor) AS count FROM events
       WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC`,
    db`SELECT coalesce(city, 'Unknown') AS key, count(DISTINCT visitor) AS count FROM events
       WHERE type = 'pageview' AND ts >= ${since} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    db`SELECT count(*) AS count FROM enquiries WHERE created_at >= ${since}`,
  ]);

  const t = totals[0] ?? {};
  const byBucket = new Map(series.map((r) => [String(r.bucket), r]));
  const days = RANGES.find((r) => r.value === range)!.days;
  const buckets = hourly
    ? Array.from({ length: 24 }, (_, h) => ({ key: String(h), label: `${h}:00` }))
    : Array.from({ length: days }, (_, i) => {
        const d = new Date(since.getTime() + IST_OFFSET_MS + i * DAY_MS).toISOString().slice(0, 10);
        return { key: d, label: d.slice(5) };
      });

  const byType = (type: string) => counts(clicks.filter((r) => r.type === type));

  return {
    range,
    totals: {
      visits: Number(t.visits ?? 0),
      visitors: Number(t.visitors ?? 0),
      newVisitors: Number(t.new_visitors ?? 0),
      whatsapp: Number(t.whatsapp ?? 0),
      calls: Number(t.calls ?? 0),
      enquiries: Number(enquiries[0]?.count ?? 0),
    },
    series: buckets.map((b) => ({
      label: b.label,
      visits: Number(byBucket.get(b.key)?.visits ?? 0),
      visitors: Number(byBucket.get(b.key)?.visitors ?? 0),
    })),
    products: products.map((r) => ({
      id: String(r.item),
      label: String(r.label ?? r.item),
      views: Number(r.views),
      whatsapp: Number(r.whatsapp),
    })),
    combos: byType("combo"),
    categories: byType("category"),
    slides: byType("slide"),
    sources: counts(sources),
    devices: counts(devices),
    cities: counts(cities),
  };
}

export type LiveData = {
  liveNow: number;
  liveDevices: Count[];
  recent: {
    ts: string;
    type: string;
    label: string | null;
    device: string | null;
    source: string | null;
    city: string | null;
  }[];
};

/** Visitors seen in the last minute, plus the latest activity (polled every few seconds). */
export async function getLiveData(): Promise<LiveData> {
  const db = sql();
  const [live, recent] = await db.transaction([
    db`SELECT coalesce(device, 'unknown') AS key, count(*) AS count FROM presence
       WHERE last_seen > now() - interval '1 minute' GROUP BY 1 ORDER BY 2 DESC`,
    db`SELECT ts, type, label, device, source, city FROM events
       WHERE type <> 'product_view' ORDER BY ts DESC LIMIT 40`,
  ]);
  const liveDevices = counts(live);
  return {
    liveNow: liveDevices.reduce((sum, d) => sum + d.count, 0),
    liveDevices,
    recent: recent.map((r) => ({
      ts: new Date(r.ts).toISOString(),
      type: r.type,
      label: r.label,
      device: r.device,
      source: r.source,
      city: r.city,
    })),
  };
}

export type TrackingSnapshot = { dashboard: Dashboard; live: LiveData; enquiries: Enquiry[] };

/** Everything the tracking page shows that changes while it is open. */
export async function getTrackingSnapshot(range: Range): Promise<TrackingSnapshot> {
  const [dashboard, live, enquiries] = await Promise.all([getDashboard(range), getLiveData(), listEnquiries()]);
  return { dashboard, live, enquiries };
}

/**
 * Keeps the events table small: events older than 90 days are folded into daily_stats
 * (kept forever) and then deleted. Also clears stale presence rows. Cheap when there is nothing to do.
 */
export async function compactOldData(): Promise<void> {
  const db = sql();
  const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS);
  const [oldest] = await db`SELECT min(ts) AS ts FROM events`;
  if (oldest?.ts && new Date(oldest.ts) < cutoff) {
    await db.transaction([
      db`INSERT INTO daily_stats (day, type, item, count, visitors)
         SELECT (ts AT TIME ZONE ${TZ})::date, type, coalesce(item, ''), count(*), count(DISTINCT visitor)
         FROM events WHERE ts < ${cutoff} GROUP BY 1, 2, 3
         ON CONFLICT (day, type, item) DO UPDATE
           SET count = daily_stats.count + EXCLUDED.count, visitors = daily_stats.visitors + EXCLUDED.visitors`,
      db`DELETE FROM events WHERE ts < ${cutoff}`,
    ]);
  }
  await db`DELETE FROM presence WHERE last_seen < now() - interval '1 day'`;
}
