import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { contact, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles visitor data and enquiries.`,
  alternates: { canonical: "/privacy" },
};

// PLACEHOLDER: have this reviewed before launch, and update the date when it changes.
const UPDATED = "28 October 2026";

export default function PrivacyPage() {
  return (
    <main id="main" className="bg-ivory py-12 md:py-16">
      <Container className="max-w-3xl">
        <Link href="/" className="text-xs font-semibold uppercase tracking-wider text-gold-deep hover:underline">
          ← Back to {site.name}
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold uppercase md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-8 leading-relaxed text-ink [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:space-y-1">
          <section>
            <h2>Who we are</h2>
            <p>
              {site.name} {site.descriptor} is a clothing store at {contact.addressLines.join(", ")}. This policy explains
              what information this website collects and how we use it, in line with India&apos;s Digital Personal Data
              Protection Act, 2023.
            </p>
          </section>

          <section>
            <h2>What we collect when you browse</h2>
            <p>You never need an account to use this website. To understand which products people like, we record:</p>
            <ul>
              <li>Which pages and products are viewed, and which buttons are tapped (for example &ldquo;Buy on WhatsApp&rdquo;).</li>
              <li>A random ID stored in your browser, so we can tell new visits from repeat visits. It does not identify you.</li>
              <li>Your device type (mobile, tablet or computer) and approximate city, worked out from your connection. We do not store your IP address.</li>
              <li>Where you came from (for example Instagram or Google).</li>
            </ul>
            <p>We do not use advertising cookies and we do not sell or share this data.</p>
          </section>

          <section>
            <h2>When you contact us</h2>
            <p>
              If you send the contact form, we keep your name, email, phone number (if you give it) and message so we
              can reply. If you message or call us on WhatsApp or phone, that conversation happens in those apps.
            </p>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <ul>
              <li>Detailed browsing activity: 90 days. After that only daily totals (with no IDs) are kept.</li>
              <li>Contact-form messages: until you ask us to delete them, or once they are no longer needed.</li>
            </ul>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              You can clear this website&apos;s data in your browser settings at any time, which removes the random ID.
              To see, correct or delete the details you sent us, email{" "}
              <a href={`mailto:${contact.email}`} className="underline underline-offset-2">
                {contact.email}
              </a>{" "}
              or message us on WhatsApp.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
