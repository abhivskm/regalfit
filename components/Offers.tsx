import { offers } from "@/data/promotions";
import { Container } from "./ui/Container";

/** Coupon-style offer cards directly under the hero. */
export function Offers() {
  return (
    <section aria-label="Current offers" className="py-6 md:py-8">
      <Container>
        <ul className="grid gap-3 md:grid-cols-3">
          {offers.map((offer) => (
            <li
              key={offer.title}
              className="flex items-center gap-4 rounded-lg border border-dashed border-gold-deep/60 bg-gold/10 px-5 py-4"
            >
              <span className="font-display text-xl font-extrabold uppercase leading-none text-ink md:text-2xl">
                {offer.title}
              </span>
              <span className="text-sm leading-snug text-muted">
                {offer.detail}
                {offer.code && (
                  <>
                    {" "}
                    · Code <strong className="font-semibold text-ink">{offer.code}</strong>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
