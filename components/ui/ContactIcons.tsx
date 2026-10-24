import { contact } from "@/data/site";
import { whatsappLink } from "@/lib/commerce";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

const styles = {
  light: "border-line bg-ivory text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  dark: "border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold",
};

/**
 * Call and WhatsApp as icon buttons, so the phone number itself is never printed on the page.
 * (The number still lives in the tel: / wa.me links, which is what makes them work.)
 */
export function ContactIcons({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const button = `flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${styles[tone]}`;
  return (
    <ul className={`flex gap-3 ${className}`} aria-label="Contact the store">
      <li>
        <a href={contact.phoneHref} className={button}>
          <PhoneIcon />
          <span className="sr-only">Call the store</span>
        </a>
      </li>
      <li>
        <a
          href={whatsappLink("Hi Regal Fit! I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          className={button}
        >
          <WhatsAppIcon />
          <span className="sr-only">Chat on WhatsApp (opens WhatsApp)</span>
        </a>
      </li>
    </ul>
  );
}
