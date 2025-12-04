import { AdminHeader } from "@/components/admin-header/admin-header";
import { UsersTable } from "@/components/tables/users/users-table";
import { getUsers } from "@/lib/queries/users";

export default async function SettingsUsersPage() {
  const users = await getUsers();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Užívatelia", href: "/admin/users" },
        ]}
      />
      <section className="h-full flex-1">
        <UsersTable users={users} />
      </section>
    </>
  );
}
