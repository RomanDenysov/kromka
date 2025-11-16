import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { CategoryForm } from "@/components/forms/category-form";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  "use cache";
  const { id } = await params;
  const category = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!category) {
    notFound();
  }
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Kategórie", href: "/admin/categories" },
          { label: category.name },
        ]}
      />
      <section className="">
        <CategoryForm category={category} />
      </section>
    </>
  );
}
