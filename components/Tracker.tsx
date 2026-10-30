"use client";

import { useEffect } from "react";
import { getVisitIds, markSeenOnce } from "@/lib/tracker-client";

type QueuedEvent = { type: string; item?: string; label?: string };

const ENDPOINT = "/api/track";
const FLUSH_MS = 2000;
const HEARTBEAT_MS = 20_000;

/**
 * Invisible visitor tracking. Renders nothing.
 *
 * Mark elements in the page to have them counted:
 *   data-track="whatsapp" data-track-item="<id>" data-track-label="<name>"   → counted when clicked
 *   data-track-view="product" data-track-item="<id>" data-track-label="<name>" → counted once when seen
 */
export function Tracker() {
  useEffect(() => {
    const ids = getVisitIds();
    let queue: QueuedEvent[] = [];
    let sentFirst = false;

    const send = (events: QueuedEvent[], left = false) => {
      // isNew is reported once, with the first pageview of a brand-new visitor.
      const body = JSON.stringify({ v: ids.visitor, s: ids.session, src: ids.source, n: ids.isNew && !sentFirst, e: events, x: left });
      sentFirst = true;
      try {
        if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
      } catch {
        /* fall through to fetch */
      }
      void fetch(ENDPOINT, { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
    };

    const flush = () => {
      if (!queue.length) return;
      const batch = queue.slice(0, 30);
      queue = queue.slice(30);
      send(batch);
    };

    // 1. The visit itself.
    send([{ type: "pageview" }]);

    // 2. Clicks on anything marked with data-track (sent at once: the visitor may be leaving for WhatsApp).
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      queue.push({ type: el.dataset.track!, item: el.dataset.trackItem, label: el.dataset.trackLabel });
      flush();
    };
    document.addEventListener("click", onClick, { capture: true });

    // 3. Products seen on screen (half visible), once per product per session.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          const item = el.dataset.trackItem;
          if (item && markSeenOnce(item)) {
            queue.push({ type: `${el.dataset.trackView}_view`, item, label: el.dataset.trackLabel });
          }
        }
      },
      { threshold: 0.5 },
    );
    const watch = (root: ParentNode) => root.querySelectorAll("[data-track-view]").forEach((el) => observer.observe(el));
    watch(document);
    // Product grids re-render when filtered; watch new cards too.
    const mutations = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && (n.matches("[data-track-view]") ? observer.observe(n) : watch(n)));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    // 4. Send queued views regularly, and a heartbeat for the "live now" counter.
    const flushTimer = window.setInterval(flush, FLUSH_MS);
    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible" && !queue.length) send([]);
    }, HEARTBEAT_MS);
    // Leaving the tab drops the visitor from "live now" at once; coming back restores them.
    const leave = () => send(queue.splice(0, 30), true);
    const onVisibility = () => (document.visibilityState === "hidden" ? leave() : send([]));
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);

    return () => {
      flush();
      document.removeEventListener("click", onClick, { capture: true });
      observer.disconnect();
      mutations.disconnect();
      window.clearInterval(flushTimer);
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  return null;
}
