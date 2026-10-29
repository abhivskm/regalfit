/**
 * Browser side of the visitor tracking (no login, no cookies, no personal data).
 *
 * - A random visitor ID in localStorage tells new and returning visitors apart.
 * - A random session ID in sessionStorage groups one visit.
 * - The traffic source (?src=… / utm_source, the referrer, or the in-app browser) is kept per session.
 * Every storage access is wrapped: in private mode or with storage blocked, tracking just
 * falls back to in-memory IDs and the site keeps working.
 */
const KEYS = { visitor: "rf_vid", session: "rf_sid", source: "rf_src", seen: "rf_seen" };

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}
function write(storage: () => Storage, key: string, value: string): void {
  try {
    storage().setItem(key, value);
  } catch {
    /* storage unavailable: keep going */
  }
}
const local = () => window.localStorage;
const session = () => window.sessionStorage;

const memory: Partial<Record<keyof typeof KEYS, string>> = {};

export type VisitIds = { visitor: string; session: string; source: string; isNew: boolean };

let cached: VisitIds | null = null;

/** IDs and source for this visit (created on first call). */
export function getVisitIds(): VisitIds {
  if (cached) return cached;
  let visitor = read(local, KEYS.visitor) ?? memory.visitor ?? null;
  const isNew = !visitor;
  if (!visitor) {
    visitor = crypto.randomUUID();
    memory.visitor = visitor;
    write(local, KEYS.visitor, visitor);
  }
  let sessionId = read(session, KEYS.session) ?? memory.session ?? null;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    memory.session = sessionId;
    write(session, KEYS.session, sessionId);
  }
  let source = read(session, KEYS.source) ?? memory.source ?? null;
  if (!source) {
    source = detectSource();
    memory.source = source;
    write(session, KEYS.source, source);
  }
  cached = { visitor, session: sessionId, source, isNew };
  return cached;
}

/** Where the visitor came from: ?src=insta-bio wins, then utm_source, the in-app browser, the referrer. */
function detectSource(): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .slice(0, 40);
  const params = new URLSearchParams(window.location.search);
  const tagged = params.get("src") ?? params.get("utm_source");
  if (tagged) return clean(tagged) || "direct";

  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";

  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (!host || host === window.location.hostname) return "direct";
  if (/instagram/.test(host)) return "instagram";
  if (/facebook|fb\.com/.test(host)) return "facebook";
  if (/google\./.test(host)) return "google";
  if (/whatsapp|wa\.me/.test(host)) return "whatsapp";
  if (/youtube|youtu\.be/.test(host)) return "youtube";
  if (/bing\./.test(host)) return "bing";
  if (/t\.co$|twitter|x\.com/.test(host)) return "x";
  return clean(host);
}

/** Product IDs already counted as "viewed" in this session (so scrolling back doesn't recount). */
export function markSeenOnce(id: string): boolean {
  const seen = new Set((read(session, KEYS.seen) ?? "").split(",").filter(Boolean));
  if (seen.has(id)) return false;
  seen.add(id);
  write(session, KEYS.seen, [...seen].slice(-300).join(","));
  return true;
}
