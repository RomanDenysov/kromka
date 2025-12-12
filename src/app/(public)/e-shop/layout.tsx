import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageWrapper } from "@/components/shared/container";
import { defaultMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Naše Produkty",
  description:
    "Objavte širokú ponuku tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý domáci chlieb, pečivo, koláče a iné špeciality pečené s láskou a podľa tradičných receptov. Nakupujte online.",
  openGraph: {
    title: "Naše Produkty",
    description:
      "Objavte širokú ponuku tradičných slovenských pekárenských výrobkov z Pekárne Kromka. Čerstvý domáci chlieb, pečivo, koláče a iné špeciality pečené s láskou a podľa tradičných receptov. Nakupujte online.",
    images: [
      {
        url: "/images/kromka-vianoce-hero-min.webp",
        width: 1200,
        height: 630,
        alt: "Vianočná ponuka Pekárne Kromka",
      },
    ],
  },
};

type Props = {
  readonly children: ReactNode;
};

export default function EshopLayout({ children }: Props) {
  return (
    <PageWrapper className="space-y-4 pt-2">
      {/* <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} /> */}
      {/* <FeaturedCarousel /> */}
      {/* <CategoriesFilterLoader /> */}
      {/* <SimpleCategoriesFilter /> */}
      {children}
    </PageWrapper>
  );
}
