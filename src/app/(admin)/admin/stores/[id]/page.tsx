import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { StoreForm } from "@/components/forms/stores";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.admin.stores.byId.queryOptions({ id }));
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <StoreForm />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
