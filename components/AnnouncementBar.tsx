import { announcements } from "@/data/site";

/** Thin black strip above the header. Mobile shows the first message; larger screens show all. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink text-gold">
      <ul className="mx-auto flex h-9 max-w-[1920px] items-center justify-center gap-8 px-4 text-[11px] font-medium uppercase tracking-[0.18em] md:px-6">
        {announcements.map((message, i) => (
          <li key={message} className={i === 0 ? "" : "hidden md:block"}>
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
