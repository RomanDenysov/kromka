import { Suspense } from "react";
import { UsersTable } from "@/components/tables/users/users-table";
import { getUsers } from "@/features/user-management/api/queries";
import { DataTableSkeleton } from "@/widgets/data-table/data-table-skeleton";

async function UsersLoader() {
  const users = await getUsers();
  return <UsersTable users={users} />;
}

export default function SettingsUsersPage() {
  return (
    <section className="h-full flex-1">
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={5} />}>
        <UsersLoader />
      </Suspense>
    </section>
  );
}
