import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { CategoriesSidebar } from "@/components/filters/categories-sidebar";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { defaultMetadata } from "@/lib/metadata";
import { getCategories } from "@/lib/queries/categories";

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
  const categories = getCategories();
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
      <FeaturedCarousel />
      {/* <CategoriesFilterLoader /> */}
      {/* <SimpleCategoriesFilter /> */}
      <div className="flex gap-8">
        <Suspense>
          <CategoriesSidebar categories={categories} />
        </Suspense>
        {children}
      </div>
    </PageWrapper>
  );
}
