import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  FeaturedCarousel,
  FeaturedCarouselSkeleton,
} from "@/components/featured-carousel";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function FeaturedPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.public.products.list.queryOptions());
  return (
    <HydrateClient>
      <div className="min-h-60 shrink-0">
        <ErrorBoundary fallback={<div>Error loading featured products</div>}>
          <Suspense fallback={<FeaturedCarouselSkeleton />}>
            <FeaturedCarousel />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
