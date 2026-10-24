import Image from "next/image";
import { categoriesIntro } from "@/data/categories";
import type { Category } from "@/data/types";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { ScrollRow } from "./ui/ScrollRow";
import { SectionHeading } from "./ui/SectionHeading";

/** "Shop by Category" carousel. Each tile opens the Shop All grid filtered to that category. */
export function Categories({ categories }: { categories: Category[] }) {
  return (
    <section id="categories" aria-labelledby="categories-title" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <SectionHeading id="categories-title" {...categoriesIntro} />
        </Reveal>
        <div className="mt-8 md:mt-10">
          <ScrollRow label="Categories">
            {categories.map((category) => (
              <li
                key={category.slug}
                className="w-[38%] shrink-0 snap-start sm:w-[27%] md:w-[20%] lg:w-[calc((100%-6.25rem)/6)]"
              >
                <a href={`#shop-${category.slug}`} className="group block text-center">
                  <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-stone">
                    <Image
                      src={category.image.src}
                      alt={category.image.alt}
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 27vw, 38vw"
                      className="object-cover transition-transform duration-700 ease-gentle group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-3 block font-display text-xs font-semibold uppercase tracking-wide md:text-sm">
                    {category.name}
                  </span>
                </a>
              </li>
            ))}
          </ScrollRow>
        </div>
      </Container>
    </section>
  );
}
