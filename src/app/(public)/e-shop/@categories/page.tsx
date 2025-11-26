import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CategoriesReel,
  CategoriesReelSkeleton,
} from "@/components/lists/categories-reel";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function CategoriesPage() {
  prefetch(trpc.public.categories.list.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error loading categories</div>}>
        <Suspense fallback={<CategoriesReelSkeleton />}>
          <CategoriesReel />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
