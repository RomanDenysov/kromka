import { AdminHeader } from "@/components/admin-header/admin-header";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};
export default async function B2CCategoryAdminHeaderPage({ params }: Props) {
  const { id } = await params;
  const category = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });
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
