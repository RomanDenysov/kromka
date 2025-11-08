import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { UsersTable } from "@/components/tables/users/users-table";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { DataTableSkeleton } from "@/widgets/data-table/ui/data-table-skeleton";

export default function SettingsUsersPage() {
  prefetch(trpc.admin.users.list.queryOptions());

  return (
    <section className="flex size-full flex-row border-t">
      <div className="w-64 shrink-0 border-r p-4">
        <h2 className="font-medium text-base">Zoznam klientov</h2>
        <p className="text-muted-foreground text-sm">
          Vsetky klienti v systeme. Kedze je to admin panel, tak su to vsetky
          uzivatelia v systeme.
        </p>
      </div>
      <div className="flex-1">
        <HydrateClient>
          <ErrorBoundary fallback={<div>Error</div>}>
            <Suspense
              fallback={<DataTableSkeleton columnCount={4} rowCount={5} />}
            >
              <UsersTable />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </section>
  );
}
