import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import B2CProductsDrawerClientView from "./client-view";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductsDrawerPage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.admin.products.byId.queryOptions({ id }));

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error loading product</div>}>
        <Suspense fallback={<div>Loading product...</div>}>
          <B2CProductsDrawerClientView />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
