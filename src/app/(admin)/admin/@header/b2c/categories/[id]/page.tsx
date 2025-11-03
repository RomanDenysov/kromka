import { getCategory } from "@/actions/categories/queries";
import { AdminHeader } from "@/components/shared/admin-header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function B2CCategoryAdminHeaderPage({ params }: Props) {
  const { id } = await params;
  const category = await getCategory(id);
  const title = category ? category.name : "Nová kategória";

  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Kategórie", href: "/admin/b2c/categories" },
        { label: title },
      ]}
    />
  );
}
