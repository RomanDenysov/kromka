import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
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
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: product?.name },
        ]}
      />
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
    </>
  );
}
