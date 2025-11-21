import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Spinner } from "@/components/ui/spinner";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export default function EshopLayout({ children }: { children: ReactNode }) {
  batchPrefetch([
    trpc.public.products.list.queryOptions(),
    trpc.public.products.infinite.infiniteQueryOptions({
      limit: 12,
      cursor: undefined,
    }),
  ]);
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error loading products</div>}>
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
