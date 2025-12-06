import type { ReactNode } from "react";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { FilterCarousel } from "@/components/lists/filter-carousel";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { getCategories, getFeaturedCategories } from "@/lib/queries/products";

type Props = {
  readonly children: ReactNode;
};

export default async function EshopLayout({ children }: Props) {
  const [categories, featuredCategories] = await Promise.all([
    getCategories(),
    getFeaturedCategories(),
  ]);
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />
      <FeaturedCarousel categories={featuredCategories} />
      <FilterCarousel categories={categories} />
      {children}
    </PageWrapper>
  );
}
