import type { Route } from "next";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StoresHeaderPage({ params }: Props) {
  const { id } = await params;
  const store = await db.query.stores.findFirst({
    where: (s, { eq: eqFn }) => eqFn(s.id, id),
  });
  const title = store ? store.name : "Nový obchod";
  return (
    <AdminHeader
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Obchody", href: "/admin/stores" as Route },
        { label: title },
      ]}
    />
  );
}
