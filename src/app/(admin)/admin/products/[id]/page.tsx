import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductForm } from "@/app/(admin)/admin/products/[id]/product-form";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { getAdminCategories } from "@/lib/queries/categories";
import { getAdminProductById } from "@/lib/queries/products";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function ProductLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [product, categories] = await Promise.all([
    getAdminProductById(decodedId),
    getAdminCategories(),
  ]);
  if (!product) {
    notFound();
  }
  return <ProductForm categories={categories} product={product} />;
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
          <ProductLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
