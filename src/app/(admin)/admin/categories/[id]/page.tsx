import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoryForm } from "@/components/forms/category-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function CategoryFormLoader({ id }: { id: string }) {
  const category = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      products: true,
      image: true,
    },
  });

  return <CategoryForm category={category} />;
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
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
          <CategoryFormLoader id={id} />
        </Suspense>
      </section>
    </>
  );
}
