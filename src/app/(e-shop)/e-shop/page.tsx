import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ProductsReel,
  ProductsReelSkeleton,
} from "@/components/lists/products-reel";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function EshopPage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const searchParams = await props.searchParams;
  const categoryId = searchParams.category;

  const queryClient = getQueryClient();

  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  const options = trpc.public.products.infinite.infiniteQueryOptions({
    limit: 12,
    categoryId,
  });

  await queryClient.fetchInfiniteQuery({ ...options, initialPageParam: 0 });

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error loading products reel</div>}>
        <Suspense fallback={<ProductsReelSkeleton />}>
          <ProductsReel className="grow" limit={20} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

/* We will call the endpoint to get the: */
// - Featured products (which category should be displayed as featured)
// - Categories (list of categories)
// - Products (list of products)

// We need some table in database to store the configuration for the eshop (featured category, categories, products)
