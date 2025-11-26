import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { Spinner } from "@/components/ui/spinner";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function FeaturedPage() {
  prefetch(trpc.public.products.list.queryOptions());
  return (
    <HydrateClient>
      <div className="min-h-60 shrink-0">
        <ErrorBoundary fallback={<div>Error loading featured products</div>}>
          <Suspense fallback={<Spinner />}>
            <FeaturedCarousel />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
