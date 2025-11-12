import type { Route } from "next";
import { cache } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { db } from "@/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getStore = cache(
  async (id: string) =>
    await db.query.stores.findFirst({
      where: (s, { eq: eqFn }) => eqFn(s.id, id),
    })
);

export default async function StoresHeaderPage({ params }: Props) {
  const { id } = await params;
  const store = await getStore(id);
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
