import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProductForm } from "@/features/b2c/product-management/ui/product-form";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  batchPrefetch([
    trpc.admin.products.byId.queryOptions({ id }),
    trpc.admin.categories.list.queryOptions(),
  ]);

  return (
    <div className="flex size-full">
      <div className="size-full max-w-md shrink-0 border-r bg-muted p-2 md:max-w-lg">
        <HydrateClient>
          <ErrorBoundary fallback={<div>Error loading product</div>}>
            <Suspense fallback={<div>Loading product...</div>}>
              <ProductForm />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
}
