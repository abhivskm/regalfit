import Image from "next/image";
import { categories } from "@/data/categories";
import { aboutText, contact, nav, site, social } from "@/data/site";
import { ContactIcons } from "./ui/ContactIcons";
import { Container } from "./ui/Container";
import { socialIcons } from "./ui/Icons";

/** Cached so the year is part of the prerendered page (Cache Components forbids a bare `new Date()`). */
async function CurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

const headingClass = "font-display text-xs font-bold uppercase tracking-[0.2em] text-gold";
const linkClass = "transition-colors hover:text-gold";

export function Footer() {
  return (
    <footer className="on-dark bg-ink text-sm text-ivory/70">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Image
            src="/images/brand/logo-gold.png"
            alt={`${site.name} ${site.descriptor}`}
            width={352}
            height={245}
            unoptimized
            className="h-auto w-40"
          />
          <p className="mt-5 max-w-sm leading-relaxed">{aboutText}</p>
          <ul className="mt-6 flex gap-3">
            {social.map(({ platform, label, href }) => {
              const Icon = socialIcons[platform];
              return (
                <li key={platform}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Icon />
                    <span className="sr-only">{label} (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Shop by category">
          <h2 className={headingClass}>Shop</h2>
          <ul className="mt-4 space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href={`#shop-${c.slug}`} className={linkClass}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer">
          <h2 className={headingClass}>Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {nav.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>Need Help?</h2>
          <ContactIcons tone="dark" className="mt-4" />
          <address className="mt-4 space-y-2.5 not-italic leading-relaxed">
            <a href={`mailto:${contact.email}`} className={`block ${linkClass}`}>
              {contact.email}
            </a>
            <span className="block pt-2">{contact.addressLines.join(", ")}</span>
          </address>
        </div>
      </Container>

      <div className="border-t border-ivory/10">
        <Container className="flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; <CurrentYear /> {site.name} {site.descriptor}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Made in Bhopal.
            {/* Looks like a brand mark; quietly opens the admin login (which is still password-protected). */}
            <a
              href="/admin/login"
              rel="nofollow"
              aria-label="Staff login"
              className="opacity-60 transition-opacity hover:opacity-100"
            >
              <Image
                src="/images/brand/monogram-gold.png"
                alt=""
                width={74}
                height={80}
                unoptimized
                className="h-5 w-auto"
              />
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
