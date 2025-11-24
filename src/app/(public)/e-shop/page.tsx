import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FeaturedCarousel } from "@/components/featured-carousel";
import {
  CategoriesReel,
  CategoriesReelSkeleton,
} from "@/components/lists/categories-reel";
import {
  ProductsReel,
  ProductsReelSkeleton,
} from "@/components/lists/products-reel";
import { AppBreadcrumbs } from "@/components/shared/app-breadcrumbs";
import { PageWrapper } from "@/components/shared/container";
import { Spinner } from "@/components/ui/spinner";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/trpc/server";

export default async function EshopPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const categoryId = searchParams.category;

  const queryClient = getQueryClient();

  batchPrefetch([
    trpc.public.products.list.queryOptions(),
    trpc.public.categories.list.queryOptions(),
  ]);

  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  const options = trpc.public.products.infinite.infiniteQueryOptions({
    limit: 12,
    categoryId,
  });
  await queryClient.fetchInfiniteQuery({ ...options, initialPageParam: 0 });
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error loading products</div>}>
        <PageWrapper>
          <AppBreadcrumbs items={[{ label: "E-shop", href: "/eshop" }]} />
          <div className="min-h-60 shrink-0">
            <Suspense fallback={<Spinner />}>
              <FeaturedCarousel />
            </Suspense>
          </div>
          <Suspense fallback={<CategoriesReelSkeleton />}>
            <CategoriesReel />
          </Suspense>

          <Suspense fallback={<ProductsReelSkeleton />}>
            <ProductsReel className="grow" limit={20} />
          </Suspense>
        </PageWrapper>
      </ErrorBoundary>
    </HydrateClient>
  );
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
