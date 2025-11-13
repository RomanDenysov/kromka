import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { HydrateClient } from "@/trpc/server";
import { StoreClientPage } from "./client-page";

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
        <section className="flex h-full">
          <div className="w-full max-w-md shrink-0 border-r p-4">
            <Suspense fallback={<FormSkeleton />}>
              <StoreClientPage storeId={id} />
            </Suspense>
          </div>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
