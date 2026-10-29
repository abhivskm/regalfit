"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { contact, nav, site } from "@/data/site";
import type { Category } from "@/data/types";
import { whatsappLink } from "@/lib/commerce";
import { ContactIcons } from "./ui/ContactIcons";
import { CloseIcon, MenuIcon, PhoneIcon, WhatsAppIcon } from "./ui/Icons";

const iconButton = "flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-stone";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a href="#home" className="flex items-center gap-2.5" onClick={onClick}>
      <Image src="/images/brand/monogram-gold.png" alt="" width={74} height={80} unoptimized className="h-9 w-auto" />
      <span className="font-display text-lg font-bold uppercase tracking-[0.14em]">
        {site.name}
        <span className="sr-only"> {site.descriptor}, back to top</span>
      </span>
    </a>
  );
}

/** Sticky white header: logo, shop links, WhatsApp and call shortcuts; full-screen menu on mobile. */
export function Navbar({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  // While the mobile menu is open: focus its close button, and close on Escape
  // (handing focus back to the toggle).
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    // data-menu-open locks page scroll while the menu is open (see globals.css).
    <header data-menu-open={open} className="sticky top-0 z-50 border-b border-line bg-ivory">
      <nav aria-label="Main" className="mx-auto flex h-17 w-full max-w-[1920px] items-center gap-4 px-4 md:px-6">
        <button
          ref={toggleRef}
          type="button"
          className={`${iconButton} -ml-2 lg:hidden`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Open menu</span>
          <MenuIcon width={24} height={24} />
        </button>

        <Logo />

        <ul className="ml-auto hidden items-center gap-7 lg:flex">
          {nav.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative py-2 font-display text-[13px] font-semibold uppercase tracking-[0.08em] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-6">
          <a href={contact.phoneHref} className={iconButton} data-track="call">
            <span className="sr-only">Call the store</span>
            <PhoneIcon />
          </a>
          <a
            href={whatsappLink("Hi Regal Fit! I have a question.")}
            data-track="whatsapp_general"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 hidden items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-ivory transition-colors hover:bg-gold hover:text-ink sm:inline-flex"
          >
            <WhatsAppIcon width={16} height={16} /> Order on WhatsApp
          </a>
          <a
            href={whatsappLink("Hi Regal Fit! I have a question.")}
            data-track="whatsapp_general"
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconButton} sm:hidden`}
          >
            <span className="sr-only">Order on WhatsApp</span>
            <WhatsAppIcon />
          </a>
        </div>
      </nav>

      {/* Full-screen mobile menu. */}
      <div id="mobile-menu" hidden={!open} className="fixed inset-0 z-60 overflow-y-auto bg-ivory lg:hidden">
        <div className="flex h-17 items-center justify-between border-b border-line px-4">
          <Logo onClick={close} />
          <button ref={closeRef} type="button" onClick={close} className={`${iconButton} -mr-2`}>
            <span className="sr-only">Close menu</span>
            <CloseIcon width={24} height={24} />
          </button>
        </div>
        <div className="px-4 pb-10 pt-4">
          <ul className="divide-y divide-line">
            {nav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block py-4 font-display text-lg font-bold uppercase tracking-wide"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-deep">Categories</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <a
                  href={`#shop-${c.slug}`}
                  data-track="category"
                  data-track-item={c.slug}
                  data-track-label={c.name}
                  onClick={close}
                  className="block rounded-md bg-stone px-3 py-3 text-sm font-medium"
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm leading-relaxed text-muted">{contact.addressLines.join(", ")}</p>
          <ContactIcons className="mt-4" />
        </div>
      </div>
    </header>
  );
}
