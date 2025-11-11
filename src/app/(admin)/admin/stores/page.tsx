import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { StoresTable } from "@/components/tables/stores/table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function StoresPage() {
  prefetch(trpc.admin.stores.list.queryOptions());
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <StoresTable />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
