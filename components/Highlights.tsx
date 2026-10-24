import type { JSX, SVGProps } from "react";
import { highlights } from "@/data/testimonials";
import type { HighlightIcon } from "@/data/types";
import { Container } from "./ui/Container";
import { ExchangeIcon, MapPinIcon, ShirtIcon, WhatsAppIcon } from "./ui/Icons";

const icons: Record<HighlightIcon, (p: SVGProps<SVGSVGElement>) => JSX.Element> = {
  fabric: ShirtIcon,
  exchange: ExchangeIcon,
  whatsapp: WhatsAppIcon,
  store: MapPinIcon,
};

/** "Why Regal Fit" trust strip with four icon highlights. */
export function Highlights() {
  return (
    <section aria-label="Why shop with Regal Fit" className="on-dark bg-ink py-10 text-ivory md:py-12">
      <Container>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = icons[item.icon];
            return (
              <li key={item.title} className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-4 md:text-left">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon width={22} height={22} />
                </span>
                <div className="mt-3 md:mt-0">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wide">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ivory/70 md:text-sm">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
