"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

const arrowClass =
  "absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-ink shadow-lg ring-1 ring-line transition-opacity duration-300 hover:bg-ink hover:text-ivory disabled:pointer-events-none disabled:opacity-0 md:flex";

type ScrollRowProps = {
  /** Accessible name for the list, e.g. "New arrivals". */
  label: string;
  /** The <li> items. Each sets its own width (e.g. `w-[46%] lg:w-1/4`). */
  children: ReactNode;
};

/**
 * Horizontal, swipeable row with prev/next arrows on larger screens.
 * Built on native scrolling with scroll-snap, so touch, trackpad and keyboard all work for free.
 * The row bleeds to the screen edge on mobile so the next item peeks in.
 */
export function ScrollRow({ label, children }: ScrollRowProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  // Re-check the arrow states whenever the row resizes (also runs once on mount).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        aria-label={label}
        // `relative` makes the row the containing block for absolutely positioned children
        // (e.g. sr-only labels), so off-screen items can't widen the page.
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 scrollbar-none md:-mx-6 md:scroll-px-6 md:gap-5 md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <button type="button" onClick={() => scrollByPage(-1)} disabled={atStart} className={`${arrowClass} -left-2`}>
        <span className="sr-only">Scroll {label} left</span>
        <ChevronLeftIcon />
      </button>
      <button type="button" onClick={() => scrollByPage(1)} disabled={atEnd} className={`${arrowClass} -right-2`}>
        <span className="sr-only">Scroll {label} right</span>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
