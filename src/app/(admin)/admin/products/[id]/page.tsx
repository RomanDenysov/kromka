import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAllergens } from "@/features/allergens/api/queries";
import { getAdminCategories } from "@/features/categories/api/queries";
import { getAdminProductById } from "@/features/products/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { FormContainer } from "./form-container";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function ProductFormLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [product, categories, allergens] = await Promise.all([
    getAdminProductById(decodedId),
    getAdminCategories(),
    getAllergens(),
  ]);
  if (!product) {
    notFound();
  }
  return (
    <FormContainer
      allergens={allergens}
      categories={categories}
      product={product}
    />
  );
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
