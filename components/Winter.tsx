import Image from "next/image";
import { winter } from "@/data/promotions";
import { ButtonLink } from "./ui/Button";
import { Container } from "./ui/Container";
import { ArrowRightIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/** Winter Rollout: one wide banner above three category tiles. */
export function Winter() {
  const { banner, tiles } = winter;

  return (
    <section id="winter" aria-labelledby="winter-title" className="bg-stone py-12 md:py-16">
      <Container>
        <Reveal>
          <SectionHeading id="winter-title" eyebrow={winter.eyebrow} title={winter.title} description={winter.description} />
        </Reveal>

        <Reveal className="mt-8 md:mt-10">
          <div className="on-dark relative isolate flex aspect-4/5 items-end overflow-hidden rounded-lg bg-ink text-ivory sm:aspect-video lg:aspect-[21/8] lg:items-center">
            <Image
              src={banner.image.src}
              alt={banner.image.alt}
              fill
              sizes="(min-width: 1920px) 1872px, 100vw"
              className="-z-20 object-cover object-[center_30%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/40 to-transparent lg:bg-linear-to-r lg:from-ink/85 lg:via-ink/40"
            />
            <div className="p-6 md:p-10 lg:max-w-xl lg:p-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">{winter.eyebrow}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none md:text-5xl">
                {banner.title}
              </h3>
              <p className="mt-3 text-sm text-ivory/85 md:text-base">{banner.text}</p>
              <ButtonLink href={banner.cta.href} variant="gold" className="mt-6">
                {banner.cta.label}
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        <ul className="mt-3 grid grid-cols-3 gap-3 md:mt-5 md:gap-5">
          {tiles.map((tile, i) => (
            <li key={tile.title}>
              <Reveal delay={i * 80}>
                <a href={tile.href} className="group relative block aspect-3/4 overflow-hidden rounded-lg bg-ink">
                  <Image
                    src={tile.image.src}
                    alt={tile.image.alt}
                    fill
                    sizes="32vw"
                    className="object-cover transition-transform duration-700 ease-gentle group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 font-display text-xs font-bold uppercase tracking-wide text-ivory md:p-5 md:text-xl">
                    {tile.title}
                    <ArrowRightIcon className="hidden shrink-0 transition-transform group-hover:translate-x-1 md:block" />
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
