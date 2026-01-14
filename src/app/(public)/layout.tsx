import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/login-modal";
import { JsonLd } from "@/components/seo/json-ld";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { preloadFavorites } from "@/features/favorites/queries";
import { preloadProducts } from "@/features/products/queries";
import { defaultMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";
import { Header } from "./_components/header";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Pripravte sa na Vianoce s Pekárňou Kromka. Voňavá kváskova vianočka, makový a orechový závin a čerstvý chlieb na sviatočný stôl. Remeselná kvalita s láskou.",
  ...defaultMetadata,
};

type Props = {
  readonly children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  preloadProducts();
  preloadFavorites();

  return (
    <>
      <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      <Header />
      <main className="min-h-svh">{children}</main>
      <Footer />

      <LoginModal />
      <ScrollToTop />
    </>
  );
}
