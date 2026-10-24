"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type TouchEvent } from "react";
import { heroIntervalMs } from "@/data/hero";
import { site } from "@/data/site";
import type { HeroSlide } from "@/data/types";
import { withAspect } from "@/lib/image-loader";
import { ButtonLink } from "./ui/Button";
import { Container } from "./ui/Container";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "./ui/Icons";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

const SWIPE_THRESHOLD = 50;

/**
 * Art-directed slide photo: the CDN crops a wide 2:1 frame for tablet/desktop and a tall 3:5
 * frame for phones, so neither downloads the full portrait original.
 */
function SlidePicture({ slide, first, onLoad }: { slide: HeroSlide; first: boolean; onLoad?: () => void }) {
  const common = {
    alt: slide.image.alt,
    fill: true,
    sizes: "100vw",
    quality: 60,
    loading: "eager",
    // The first slide is the LCP image; later slides load at low priority.
    fetchPriority: first ? "high" : "low",
    className: "-z-20 object-cover",
  } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: withAspect(slide.image.src, "2:1") });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({ ...common, src: withAspect(slide.image.src, "3:5") });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide} sizes="100vw" />
      <img
        {...rest}
        alt={slide.image.alt}
        srcSet={tall}
        onLoad={onLoad}
        // Also report images that finished loading before React hydrated.
        ref={(img) => {
          if (img?.complete && onLoad) onLoad();
        }}
      />
    </picture>
  );
}

const arrowClass =
  "flex h-12 w-12 items-center justify-center rounded-full border border-ivory/40 bg-ink/20 text-ivory backdrop-blur-sm transition-colors duration-300 hover:border-ivory hover:bg-ivory hover:text-ink";

/**
 * Full-screen hero slideshow. Auto-advances every `heroIntervalMs`, with arrows, dots and swipe.
 * Accessibility: a pause button (WCAG 2.2.2), pauses on hover, stops for good when keyboard focus
 * enters (WAI-ARIA carousel pattern), and never auto-plays for reduced-motion visitors.
 */
export function Hero({ slides: heroSlides }: { slides: HeroSlide[] }) {
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Slides 2+ wait for the first photo, so they don't compete with it for bandwidth.
  const [firstLoaded, setFirstLoaded] = useState(false);
  const markFirstLoaded = () => setFirstLoaded(true);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const touchStartX = useRef<number | null>(null);

  const autoplay = firstLoaded && !userPaused && !hovered && !reducedMotion;
  const goTo = (next: number) => setIndex((next + count) % count);

  // Restart the timer on every slide change, so manual navigation also gets a full interval.
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), heroIntervalMs);
    return () => window.clearTimeout(timer);
  }, [autoplay, index, count]);

  // Keyboard users who tab into the slideshow stop the rotation; mouse clicks don't.
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    if (e.target.matches(":focus-visible")) setUserPaused(true);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD) goTo(index + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured drops"
      className="on-dark relative overflow-hidden bg-ink text-ivory"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={onFocus}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <h1 className="sr-only">
        {site.name} {site.descriptor}: {site.tagline}
      </h1>

      {/* Announce slide changes to screen readers only when they are not changing on their own. */}
      <div
        aria-live={autoplay ? "off" : "polite"}
        className="flex transition-transform duration-700 ease-gentle motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {heroSlides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.eyebrow || slide.title}`}
              aria-hidden={!active}
              inert={!active}
              className="relative isolate flex h-[78svh] max-h-[820px] min-h-[520px] w-full shrink-0 items-center"
            >
              {/* Slides 2+ start loading only once the first photo is on screen. */}
              {(i === 0 || firstLoaded) && (
                <SlidePicture slide={slide} first={i === 0} onLoad={i === 0 ? markFirstLoaded : undefined} />
              )}
              {/* Evenly darkens the photo behind the centred copy (AA contrast). */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-ink/60 bg-linear-to-b from-ink/40 via-transparent to-ink/75"
              />

              {/* Copy travels with its slide (no fade), so it is always at full contrast. */}
              <Container className="flex flex-col items-center py-20 text-center">
                {slide.eyebrow && (
                  <p className="mb-5 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                    <span aria-hidden="true" className="h-px w-8 bg-gold md:w-12" />
                    {slide.eyebrow}
                    <span aria-hidden="true" className="h-px w-8 bg-gold md:w-12" />
                  </p>
                )}
                <h2 className="max-w-4xl font-display text-[clamp(2.75rem,8vw,6rem)] font-extrabold uppercase leading-[0.95] tracking-tight">
                  {slide.title}
                </h2>
                {slide.intro && <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/85 md:text-lg">{slide.intro}</p>}
                <ButtonLink href={slide.cta.href} variant="gold" className="mt-8">
                  {slide.cta.label}
                </ButtonLink>
              </Container>
            </div>
          );
        })}
      </div>

      {/* Side arrows (tablet and up). */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        className={`${arrowClass} absolute left-4 top-1/2 hidden -translate-y-1/2 md:left-6 md:flex`}
      >
        <span className="sr-only">Previous slide</span>
        <ChevronLeftIcon width={22} height={22} />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        className={`${arrowClass} absolute right-4 top-1/2 hidden -translate-y-1/2 md:right-6 md:flex`}
      >
        <span className="sr-only">Next slide</span>
        <ChevronRightIcon width={22} height={22} />
      </button>

      {/* Bottom bar: arrows on mobile, dots, pause/play. */}
      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3 md:bottom-10">
        <button type="button" onClick={() => goTo(index - 1)} className={`${arrowClass} h-10 w-10 md:hidden`}>
          <span className="sr-only">Previous slide</span>
          <ChevronLeftIcon width={18} height={18} />
        </button>

        <div className="flex items-center">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === index}
              className="group px-1.5 py-4"
            >
              <span className="sr-only">
                Show slide {i + 1}: {slide.eyebrow || slide.title}
              </span>
              <span
                aria-hidden="true"
                className={`block h-0.5 transition-all duration-500 ${
                  i === index ? "w-10 bg-gold" : "w-6 bg-ivory/45 group-hover:bg-ivory"
                }`}
              />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => goTo(index + 1)} className={`${arrowClass} h-10 w-10 md:hidden`}>
          <span className="sr-only">Next slide</span>
          <ChevronRightIcon width={18} height={18} />
        </button>

        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            className={`${arrowClass} h-10 w-10`}
          >
            <span className="sr-only">{userPaused ? "Play slideshow" : "Pause slideshow"}</span>
            {userPaused ? <PlayIcon width={16} height={16} /> : <PauseIcon width={16} height={16} />}
          </button>
        )}
      </div>
    </section>
  );
}
