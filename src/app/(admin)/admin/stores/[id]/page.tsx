import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { Separator } from "@/components/ui/separator";
import { getAdminStoreById } from "@/lib/queries/stores";
import { StoreFormContainer } from "./_components/store-form-container";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function StoreLoader({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const store = await getAdminStoreById(decodedId);
  if (!store) {
    notFound();
  }
  return (
    <StoreFormContainer
      className="w-full @md/page:max-w-md shrink-0 p-4"
      store={store}
    />
  );
}

export default function StorePage({ params }: Props) {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody", href: "/admin/stores" },
          { label: "Upraviť obchod" },
        ]}
      />
      <section className="@container/page flex size-full flex-1 flex-col sm:flex-row">
        <Suspense
          fallback={
            <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
          }
        >
          <StoreLoader params={params} />
        </Suspense>
        <Separator className="h-full" orientation="vertical" />
      </section>
    </>
  );
}
