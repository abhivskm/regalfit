import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Categories } from "@/components/Categories";
import { Combos } from "@/components/Combos";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { Navbar } from "@/components/Navbar";
import { NewArrivals } from "@/components/NewArrivals";
import { Offers } from "@/components/Offers";
import { Reviews } from "@/components/Reviews";
import { ShopAll } from "@/components/ShopAll";
import { Winter } from "@/components/Winter";
import { contact, site, social } from "@/data/site";
import { getContent } from "@/lib/content";

// Local business structured data, so search engines can show the store's address and phone.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: `${site.name} ${site.descriptor}`,
  description: site.description,
  url: site.url,
  image: `${site.url}/opengraph-image.jpg`,
  logo: `${site.url}/images/brand/logo-gold.png`,
  telephone: contact.phoneHref.replace("tel:", ""),
  email: contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.addressLines[0],
    addressLocality: "Bhopal",
    addressRegion: "Madhya Pradesh",
    addressCountry: "IN",
  },
  sameAs: social.map((s) => s.href),
};

export default async function Home() {
  // Edited in the admin portal; refreshed the moment the admin saves.
  const content = await getContent();

  return (
    <>
      <AnnouncementBar />
      <Navbar categories={content.categories} />
      <main id="main">
        <Hero slides={content.heroSlides} />
        <Offers />
        <Categories categories={content.categories} />
        <NewArrivals products={content.products} categories={content.categories} />
        <Combos combos={content.combos} />
        <Winter />
        <ShopAll products={content.products} categories={content.categories} />
        <Reviews />
        <Highlights />
        <Contact />
      </main>
      <Footer categories={content.categories} />
      <script
        type="application/ld+json"
        // Escape "<" so content can never close the script tag early.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
