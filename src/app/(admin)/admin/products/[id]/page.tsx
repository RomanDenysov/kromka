import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import NotFound from "@/app/not-found";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";
import { ProductForm } from "@/features/b2c/product-management/ui/product-form";
import { HydrateClient } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function B2CProductPage({ params }: Props) {
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
  });

  if (!product) {
    notFound();
  }

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: product?.name },
        ]}
      />

      <ErrorBoundary fallback={<NotFound />}>
        <Suspense fallback={<FormSkeleton />}>
          <ProductForm />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
