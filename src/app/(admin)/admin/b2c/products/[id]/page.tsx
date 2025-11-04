import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.admin.products.byId.queryOptions({ id }));

  return (
    <div className="flex size-full">
      <div className="size-full max-w-md shrink-0 border-r bg-muted md:max-w-lg">
        <HydrateClient>
          <ErrorBoundary fallback={<div>Error loading product</div>}>
            <Suspense fallback={<div>Loading product...</div>} />
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
}
