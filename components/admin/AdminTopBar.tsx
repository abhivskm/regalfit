import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/admin/actions";

const PAGES = [
  { id: "edit", href: "/admin", label: "Edit site" },
  { id: "tracking", href: "/admin/tracking", label: "Tracking" },
] as const;

/** Top bar shared by the admin pages: switch between editing and tracking, view the site, log out. */
export function AdminTopBar({ active }: { active: (typeof PAGES)[number]["id"] }) {
  return (
    <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-3 md:px-6">
      <Image src="/images/brand/monogram-gold.png" alt="" width={74} height={80} unoptimized className="h-8 w-auto" />
      <span className="hidden font-display text-sm font-bold uppercase tracking-wide sm:inline">Regal Fit Admin</span>
      <nav aria-label="Admin pages" className="ml-2 flex gap-1 rounded-md bg-stone p-1">
        {PAGES.map((page) => (
          <Link
            key={page.id}
            href={page.href}
            aria-current={active === page.id ? "page" : undefined}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === page.id ? "bg-ink text-ivory" : "text-muted hover:text-ink"
            }`}
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto hidden text-xs font-semibold underline-offset-4 hover:underline sm:inline"
      >
        View website ↗
      </a>
      <form action={logout} className="ml-auto sm:ml-0">
        <button type="submit" className="rounded-md border border-line px-3 py-2 text-xs font-semibold hover:border-ink">
          Log out
        </button>
      </form>
    </div>
  );
}
