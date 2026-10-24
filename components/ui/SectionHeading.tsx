type SectionHeadingProps = {
  /** Used as the <h2> id, so the section can reference it with aria-labelledby. */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

/** Small gold label, bold uppercase title and a one-line tagline, in the e-commerce style. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-deep">{eyebrow}</p>
      <h2
        id={id}
        className="mt-2 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
      >
        {title}
      </h2>
      {description && <p className="mt-2 text-sm text-muted md:text-base">{description}</p>}
    </div>
  );
}
