import { reviews, reviewsIntro } from "@/data/testimonials";
import { Container } from "./ui/Container";
import { StarIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { ScrollRow } from "./ui/ScrollRow";
import { SectionHeading } from "./ui/SectionHeading";

/** Customer reviews in a swipeable row: star rating, quote, name and what they bought. */
export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="py-12 md:py-16">
      <Container>
        <Reveal>
          <SectionHeading id="reviews-title" {...reviewsIntro} />
        </Reveal>
        <div className="mt-8 md:mt-10">
          <ScrollRow label="Customer reviews">
            {reviews.map((review) => (
              <li
                key={review.name}
                className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <figure className="flex h-full flex-col rounded-lg border border-line bg-ivory p-6">
                  <div className="flex gap-0.5 text-gold" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon key={i} width={16} height={16} className={i < review.rating ? "" : "text-line"} />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4">
                    <span className="block font-display text-sm font-semibold">{review.name}</span>
                    <span className="mt-0.5 block text-xs text-muted">Bought: {review.product}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ScrollRow>
        </div>
      </Container>
    </section>
  );
}
