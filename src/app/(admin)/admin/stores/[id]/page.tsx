import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { db } from "@/db";
import { HydrateClient } from "@/trpc/server";
import { StoreClientPage } from "./client";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  // prefetch(trpc.admin.stores.byId.queryOptions({ id }));

  const store = await db.query.stores.findFirst({
    where: (s, { eq }) => eq(s.id, id),
  });
  const title = store ? store.name : "Nový obchod";
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody", href: "/admin/stores" },
          { label: title },
        ]}
      />
      <HydrateClient>
        <ErrorBoundary fallback={<div>Error</div>}>
          <section className="h-full flex-1">
            <Suspense fallback={<FormSkeleton />}>
              <StoreClientPage storeId={id} />
            </Suspense>
          </section>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}
