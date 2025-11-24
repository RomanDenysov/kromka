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
import { Container } from "@/components/shared/container";
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
        <Container className="flex h-full flex-col gap-6 border py-5 md:pb-20">
          <div className="min-h-60 border-border border-b">
            <Suspense fallback={<Spinner />}>
              <FeaturedCarousel />
            </Suspense>
          </div>
          <Suspense fallback={<CategoriesReelSkeleton />}>
            <CategoriesReel />
          </Suspense>

          <Suspense fallback={<ProductsReelSkeleton />}>
            <ProductsReel limit={20} />
          </Suspense>
        </Container>
      </ErrorBoundary>
    </HydrateClient>
  );
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
