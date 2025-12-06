import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoryForm } from "@/components/forms/category-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getCategoryById(id: string) {
  "use cache";
  cacheLife("minutes");
  return await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: {
      products: true,
      image: true,
    },
  });
}

async function CategoryFormLoader({ id }: { id: string }) {
  const category = await getCategoryById(id);

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
          <CategoryPageContent params={params} />
        </Suspense>
      </section>
    </>
  );
}

async function CategoryPageContent({ params }: Props) {
  const { id } = await params;
  return <CategoryFormLoader id={id} />;
}
