import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { HydrateClient } from "@/trpc/server";
import { StoreClientPage } from "./client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  // prefetch(trpc.admin.stores.byId.queryOptions({ id }));
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="h-full flex-1">
          <Suspense fallback={<FormSkeleton />}>
            <StoreClientPage storeId={id} />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
