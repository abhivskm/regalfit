import type { Visit } from "./analytics";

/** Crawlers, link previews, monitoring and test browsers: not counted as visitors. */
const BOT_UA =
  /bot|crawl|spider|slurp|preview|lighthouse|headless|facebookexternalhit|whatsapp\/|curl|wget|python|node-fetch|axios|vercel/i;

const ID = /^[a-z0-9-]{8,64}$/i;
const SOURCE = /^[a-z0-9._-]{1,40}$/;

export const isBot = (userAgent: string) => !userAgent || BOT_UA.test(userAgent);

function device(userAgent: string): string {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobi))/i.test(userAgent)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "mobile";
  return "desktop";
}

/** Vercel adds approximate location headers; the IP address itself is never stored. */
function header(headers: Headers, name: string): string | null {
  const value = headers.get(name);
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 60);
  } catch {
    return value.slice(0, 60);
  }
}

/**
 * Builds the visit context from the browser's IDs plus request headers.
 * Returns null for bots or malformed IDs (so the request is ignored).
 */
export function visitFrom(
  ids: { visitor?: unknown; session?: unknown; isNew?: unknown; source?: unknown },
  headers: Headers,
): Visit | null {
  const userAgent = headers.get("user-agent") ?? "";
  if (isBot(userAgent)) return null;
  const visitor = typeof ids.visitor === "string" ? ids.visitor : "";
  const session = typeof ids.session === "string" ? ids.session : "";
  if (!ID.test(visitor) || !ID.test(session)) return null;
  const source = typeof ids.source === "string" && SOURCE.test(ids.source) ? ids.source : "direct";
  return {
    visitor,
    session,
    isNew: ids.isNew === true,
    source,
    device: device(userAgent),
    city: header(headers, "x-vercel-ip-city"),
    region: header(headers, "x-vercel-ip-country-region"),
    country: header(headers, "x-vercel-ip-country"),
  };
}
