import Image from "next/image";
import type { Product } from "@/data/types";
import { discountPercent, formatPrice, orderLink } from "@/lib/commerce";
import { WhatsAppIcon } from "./ui/Icons";

const badgeLabel = { new: "New", bestseller: "Bestseller" } as const;

type ProductCardProps = {
  product: Product;
  /** Display name of the product's category. */
  categoryLabel: string;
  /** Passed to next/image `sizes`; defaults suit a 2 / 3 / 4-column grid. */
  sizes?: string;
};

/** Product tile: photo, badge, name, price with MRP and discount, and a WhatsApp order button. */
export function ProductCard({
  product,
  categoryLabel,
  sizes = "(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw",
}: ProductCardProps) {
  const off = discountPercent(product.price, product.mrp);
  const badge = product.tags[0];

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-stone">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-gentle group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-wider text-gold">
            {badgeLabel[badge]}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] uppercase tracking-wider text-muted">{categoryLabel}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-ink">{product.name}</h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-base font-bold">{formatPrice(product.price)}</span>
          <s className="text-xs text-muted">
            <span className="sr-only">MRP </span>
            {formatPrice(product.mrp)}
          </s>
          <span className="text-xs font-semibold text-sale">{off}% OFF</span>
        </p>
        {/* mt-auto keeps the button aligned along the bottom of a row of cards. */}
        <div className="mt-auto pt-3">
          <a
            href={orderLink(product.name, product.price)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md border border-ink py-2.5 font-display text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-ivory"
          >
            <WhatsAppIcon width={16} height={16} />
            <span>
              Buy <span className="sr-only">{product.name} </span>on WhatsApp
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
