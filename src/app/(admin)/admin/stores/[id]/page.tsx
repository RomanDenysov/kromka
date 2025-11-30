import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { Separator } from "@/components/ui/separator";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { StoreDetails } from "./store-details";

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
      <section className="@container/page flex size-full flex-1 flex-col sm:flex-row">
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense
            fallback={
              <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
            }
          >
            <StoreForm
              className="w-full @md/page:max-w-md shrink-0 p-4"
              id={id}
            />
          </Suspense>
        </ErrorBoundary>
        <Separator className="h-full" orientation="vertical" />
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense>
            <StoreDetails
              className="w-full @md/page:max-w-full grow p-4"
              id={id}
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </HydrateClient>
  );
}
