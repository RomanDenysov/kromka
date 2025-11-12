import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { StoreForm } from "@/components/forms/stores";
import { Spinner } from "@/components/ui/spinner";
import { db } from "@/db";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.admin.stores.byId.queryOptions({ id }));
  const store = await db.query.stores.findFirst({
    where: (s, { eq: eqFn }) => eqFn(s.id, id),
  });
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="flex h-full">
          <div className="w-full max-w-md shrink-0 border-r p-4">
            <Suspense fallback={<Spinner className="size-10" />}>
              <StoreForm store={store} />
            </Suspense>
          </div>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
