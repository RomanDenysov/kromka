import { FeaturedCarousels } from "@/components/featured-carousel";
import { CategoriesReel } from "@/components/lists/categories-reel";
import { ProductsReel } from "@/components/lists/products-reel";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { db } from "@/db";

export const DEFAULT_PRODUCTS_LIMIT = 12;

export default async function EshopPage() {
  "use cache";
  const categories = await db.query.categories.findMany({
    where: (category, { eq, and }) =>
      and(
        eq(category.isActive, true),
        eq(category.showInMenu, true),
        eq(category.isFeatured, false)
      ),
  });

  return (
    <PageWrapper>
      <AppBreadcrumbs items={[{ label: "E-shop", href: "/e-shop" }]} />

      <FeaturedCarousels />

      <CategoriesReel categories={categories} />

      <ProductsReel className="grow" limit={DEFAULT_PRODUCTS_LIMIT} />
    </PageWrapper>
  );
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
