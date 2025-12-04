import { Suspense } from "react";
import { FeaturedCarousels } from "@/components/featured-carousel";
import { CategoriesReel } from "@/components/lists/categories-reel";
import {
  ProductsReel,
  ProductsReelSkeleton,
} from "@/components/lists/products-reel";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";

export const DEFAULT_PRODUCTS_LIMIT = 12;

export default function EshopPage() {
  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />

      <FeaturedCarousels />

      <CategoriesReel />

      <Suspense fallback={<ProductsReelSkeleton />}>
        <ProductsReel className="grow" limit={DEFAULT_PRODUCTS_LIMIT} />
      </Suspense>
    </PageWrapper>
  );
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
