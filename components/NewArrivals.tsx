import { newArrivalsIntro } from "@/data/products";
import type { Category, Product } from "@/data/types";
import { ProductCard } from "./ProductCard";
import { ButtonLink } from "./ui/Button";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { ScrollRow } from "./ui/ScrollRow";
import { SectionHeading } from "./ui/SectionHeading";

/** Carousel of every product tagged "new". */
export function NewArrivals({ products, categories }: { products: Product[]; categories: Category[] }) {
  const label = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";
  const newProducts = products.filter((p) => p.tags.includes("new"));
  if (!newProducts.length) return null;

  return (
    <section id="new-arrivals" aria-labelledby="new-arrivals-title" className="bg-stone py-12 md:py-16">
      <Container>
        <Reveal>
          <SectionHeading id="new-arrivals-title" {...newArrivalsIntro} />
        </Reveal>
        <div className="mt-8 md:mt-10">
          <ScrollRow label="New arrivals">
            {newProducts.map((product) => (
              <li
                key={product.id}
                className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <ProductCard product={product} categoryLabel={label(product.category)} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 31vw, 46vw" />
              </li>
            ))}
          </ScrollRow>
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="#shop" variant="outline">
            View all products
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
