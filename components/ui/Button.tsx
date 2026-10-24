import type { AnchorHTMLAttributes } from "react";

type Variant = "solid" | "light" | "gold" | "outline";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300";

const variants: Record<Variant, string> = {
  // Black button for light backgrounds.
  solid: "bg-ink text-ivory hover:bg-gold hover:text-ink",
  // White button for dark backgrounds and imagery.
  light: "bg-ivory text-ink hover:bg-gold",
  // Brand gold, for the main call to action on dark imagery.
  gold: "bg-gold text-ink hover:bg-ivory",
  // Bordered, for secondary actions.
  outline: "border border-ink text-ink hover:bg-ink hover:text-ivory",
};

/** Shared button styles, so <a> and <button> elements look identical. */
export function buttonClasses(variant: Variant = "solid", className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant };

export function ButtonLink({ variant = "solid", className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}
