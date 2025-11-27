import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  FeaturedCarousel,
  FeaturedCarouselSkeleton,
} from "@/components/featured-carousel";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function FeaturedPage() {
  const queryClient = getQueryClient();

  // Fetch featured category on server
  const featuredCategory = await queryClient.fetchQuery(
    trpc.public.categories.featured.queryOptions()
  );

  // If no featured category is set, don't render anything
  if (!featuredCategory) {
    return null;
  }

  // Prefetch products for the featured category
  await queryClient.prefetchQuery(
    trpc.public.products.featured.queryOptions({
      categoryId: featuredCategory.id,
    })
  );

  return (
    <HydrateClient>
      <div className="min-h-60 shrink-0">
        <ErrorBoundary fallback={<div>Error loading featured products</div>}>
          <Suspense fallback={<FeaturedCarouselSkeleton />}>
            <FeaturedCarousel
              categoryId={featuredCategory.id}
              categoryName={featuredCategory.name}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
