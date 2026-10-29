import { contact, contactIntro, social } from "@/data/site";
import { whatsappLink } from "@/lib/commerce";
import { ContactForm } from "./ContactForm";
import { buttonClasses } from "./ui/Button";
import { ContactIcons } from "./ui/ContactIcons";
import { Container } from "./ui/Container";
import { ArrowRightIcon, socialIcons, WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.24em] text-muted";
const linkClass = "font-medium underline-offset-4 hover:text-gold-deep hover:underline";

/** Store details and quick WhatsApp ordering on one side, the enquiry form on the other. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-stone py-12 md:py-16">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <SectionHeading id="contact-title" align="left" {...contactIntro} />

          <a
            href={whatsappLink("Hi Regal Fit! I'd like to know what's in stock.")}
            data-track="whatsapp_general"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("solid", "mt-8")}
          >
            <WhatsAppIcon width={18} height={18} /> Chat on WhatsApp
          </a>

          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className={labelClass}>Store</dt>
              <dd className="mt-2 leading-relaxed">
                <address className="not-italic">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={contact.mapUrl}
                  data-track="directions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-ink underline decoration-gold decoration-2 underline-offset-[6px] hover:text-gold-deep"
                >
                  Get directions <ArrowRightIcon width={16} height={16} />
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Call or WhatsApp</dt>
              <dd className="mt-2">
                <ContactIcons />
              </dd>
            </div>
            <div>
              <dt className={labelClass}>Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${contact.email}`} className={linkClass}>
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className={labelClass}>Hours</dt>
              <dd className="mt-2 leading-relaxed">
                {contact.hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <ul className="mt-8 flex gap-3" aria-label="Social media">
            {social.map(({ platform, label, href }) => {
              const Icon = socialIcons[platform];
              return (
                <li key={platform}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ivory text-ink transition-colors hover:border-ink hover:bg-ink hover:text-ivory"
                  >
                    <Icon />
                    <span className="sr-only">{label} (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
