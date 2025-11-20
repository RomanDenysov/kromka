import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;

  prefetch(trpc.admin.stores.byId.queryOptions({ id }));

  return (
    <HydrateClient>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody", href: "/admin/stores" },
          { label: "Upraviť obchod" },
        ]}
      />
      <ErrorBoundary fallback={<div>Error</div>}>
        <section className="h-full flex-1 p-4">
          <Suspense fallback={<FormSkeleton className="max-w-md" />}>
            <StoreForm id={id} />
          </Suspense>
        </section>
      </ErrorBoundary>
    </HydrateClient>
  );
}
