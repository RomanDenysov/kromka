import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CategoriesReel,
  CategoriesReelSkeleton,
} from "@/components/lists/categories-reel";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export default async function CategoriesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.public.categories.list.queryOptions());

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
