import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Footer } from "@/components/landing/footer";
import { LoginModal } from "@/components/login-modal";
import { JsonLd } from "@/components/seo/json-ld";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { preloadFavorites } from "@/features/favorites/api/queries";
import { preloadProducts } from "@/features/products/api/queries";
import { defaultMetadata } from "@/lib/metadata";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/json-ld";
import { Header } from "./_components/header";
import { HeaderActions } from "./_components/header-actions";

export const metadata: Metadata = {
  title: {
    default: "Pekáreň Kromka – Remeselná pekáreň",
    template: "%s | Pekáreň Kromka",
  },
  description:
    "Remeselná pekáreň na východnom Slovensku. Kváskový chlieb, pečivo a koláče z kvalitných surovín podľa tradičných receptov. Objednajte online, vyzdvihnite v predajni.",
  ...defaultMetadata,
};

interface Props {
  readonly children: ReactNode;
}

export default function PublicLayout({ children }: Props) {
  preloadProducts();
  preloadFavorites();

  return (
    <>
      <JsonLd data={[getOrganizationSchema(), getWebSiteSchema()]} />
      <Header className="sticky top-0 z-40">
        <HeaderActions />
      </Header>
      <main className="size-full min-h-svh">{children}</main>
      <Footer />
      <LoginModal />
      <Suspense>
        <ScrollToTop />
      </Suspense>
    </>
  );
}
