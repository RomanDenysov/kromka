import { Suspense } from "react";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { getAdminCategoryById } from "@/features/categories/api/queries";
import { AdminHeader } from "@/widgets/admin-header/admin-header";
import { CategoryFormContainer } from "./_components/category-form-container";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function CategoryLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const category = await getAdminCategoryById(decodedId);

  if (!category) {
    return <div>Kategória nebola nájdená</div>;
  }

  return <CategoryFormContainer category={category} />;
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
