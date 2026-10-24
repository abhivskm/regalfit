import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

// Headings: a bold geometric sans. Body: a clean, highly legible sans.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const title = `${site.name} | Streetwear & Daily Wear for Men in Bhopal`;

// Icons and the Open Graph image come from the file conventions in /app
// (icon.png, apple-icon.png, opengraph-image.jpg).
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        {/* Without JavaScript the scroll-reveal never runs, so show everything. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-ivory"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
