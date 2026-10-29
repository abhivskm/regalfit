import Image from "next/image";
import { combosIntro } from "@/data/promotions";
import type { Combo } from "@/data/types";
import { discountPercent, formatPrice, orderLink } from "@/lib/commerce";
import { Container } from "./ui/Container";
import { WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/** Value bundles: image card with the deal price and a WhatsApp order button. */
export function Combos({ combos }: { combos: Combo[] }) {
  if (!combos.length) return null;
  return (
    <section id="combos" aria-labelledby="combos-title" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <SectionHeading id="combos-title" {...combosIntro} />
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-5 lg:grid-cols-4">
          {combos.map((combo, i) => (
            <li key={combo.id}>
              <Reveal delay={i * 80} className="h-full">
                <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-ink text-ivory">
                  <div className="relative aspect-4/5 overflow-hidden">
                    <Image
                      src={combo.image.src}
                      alt={combo.image.alt}
                      fill
                      sizes="(min-width: 1024px) 24vw, 48vw"
                      className="object-cover transition-transform duration-700 ease-gentle group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded bg-gold px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-ink">
                      Save {discountPercent(combo.price, combo.mrp)}%
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4 md:p-5">
                    <h3 className="font-display text-sm font-bold uppercase leading-tight md:text-lg">{combo.title}</h3>
                    <p className="mt-1 text-xs text-ivory/70 md:text-sm">{combo.detail}</p>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-lg font-bold text-gold md:text-xl">
                        {formatPrice(combo.price)}
                      </span>
                      <s className="text-xs text-ivory/60">
                        <span className="sr-only">MRP </span>
                        {formatPrice(combo.mrp)}
                      </s>
                    </p>
                    <a
                      href={orderLink(`${combo.title} combo`, combo.price)}
                      data-track="combo"
                      data-track-item={combo.id}
                      data-track-label={combo.title}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-ivory py-2.5 font-display text-[11px] font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-gold"
                    >
                      <WhatsAppIcon width={16} height={16} />
                      <span>
                        Grab <span className="sr-only">the {combo.title} combo </span>deal
                      </span>
                    </a>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
