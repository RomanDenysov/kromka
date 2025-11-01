import type { Route } from "next";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/shared/admin-header";
import { getCategory } from "../queries";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) {
    notFound();
  }
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Categories", href: "/admin/b2c/categories" },
        { label: category.name, href: `/admin/b2c/categories/${id}` as Route },
      ]}
    />
  );
}
