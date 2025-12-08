import type { ReactNode } from "react";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { CategoriesFilterLoader } from "@/components/filters/categories-filter-loader";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

type Props = {
  readonly children: ReactNode;
};

export default function EshopLayout({ children }: Props) {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
      <FeaturedCarousel />
      <CategoriesFilterLoader />
      {children}
    </PageWrapper>
  );
}
