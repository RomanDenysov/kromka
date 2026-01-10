import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { getAdminCategories } from "@/features/categories/queries";
import { getAdminProductById } from "@/features/products/queries";
import { FormSkeleton } from "@/shared/components/form/form-skeleton";
import { FormContainer } from "./form-container";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function ProductFormLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [product, categories] = await Promise.all([
    getAdminProductById(decodedId),
    getAdminCategories(),
  ]);
  if (!product) {
    notFound();
  }
  return <FormContainer categories={categories} product={product} />;
}
export default function B2CProductPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produkty", href: "/admin/products" },
          { label: "Upraviť produkt" },
        ]}
      />

      <section className="@container/page h-full flex-1 p-4">
        <Suspense fallback={<FormSkeleton />}>
          <ProductFormLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
