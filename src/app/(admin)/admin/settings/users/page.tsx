import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UsersTable } from "@/components/tables/users/users-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default function SettingsUsersPage() {
  prefetch(trpc.admin.users.list.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <UsersTable />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
