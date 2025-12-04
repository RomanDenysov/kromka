import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { StoreDetails } from "./store-details";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: Props) {
  const { id } = await params;

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, id),
    with: {
      image: true,
      users: true,
    },
  });

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Obchody", href: "/admin/stores" },
          { label: store.name },
        ]}
      />
      <section className="@container/page flex size-full flex-1 flex-col sm:flex-row">
        <Suspense
          fallback={
            <FormSkeleton className="w-full @md/page:max-w-md shrink-0 p-4" />
          }
        >
          <StoreForm
            className="w-full @md/page:max-w-md shrink-0 p-4"
            store={store}
          />
        </Suspense>
        <Separator className="h-full" orientation="vertical" />
        <Suspense>
          <StoreDetails
            className="w-full @md/page:max-w-full grow p-4"
            store={store}
          />
        </Suspense>
      </section>
    </>
  );
}
