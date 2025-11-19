import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { ProductForm } from "@/components/forms/product-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
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
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: "Upraviť produkt" },
        ]}
      />

      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<FormSkeleton />}>
          <ProductForm id={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
