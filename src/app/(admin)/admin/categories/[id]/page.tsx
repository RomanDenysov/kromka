import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoryForm } from "@/components/forms/category-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { getAdminCategoryById } from "@/lib/queries/categories";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function CategoryLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const category = await getAdminCategoryById(decodedId);
  return <CategoryForm category={category} />;
}

export default function CategoryPage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
          { label: "Upraviť kategóriu" },
        ]}
      />
      <section className="@container/page h-full flex-1 p-4">
        <Suspense
          fallback={
            <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
          }
        >
          <CategoryLoader params={params} />
        </Suspense>
      </section>
    </>
  );
}
