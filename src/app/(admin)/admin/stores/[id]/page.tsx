import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin-header/admin-header";
import { StoreForm } from "@/components/forms/store-form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { stores } from "@/db/schema";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const tabs = [
  {
    label: "Orders",
    value: "orders",
  },
  {
    label: "Members",
    value: "members",
  },
];

export default async function StorePage({ params }: Props) {
  const { id } = await params;

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, id),
    with: {
      image: true,
      users: true,
      orders: true,
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
          <div className="flex w-full @md/page:max-w-full flex-0 grow flex-col gap-4 p-4">
            <div>
              <h2 className="font-semibold text-lg tracking-tight">
                Detaily obchodu
              </h2>
              <p className="text-muted-foreground text-sm">
                Zobrazujú sa detaily obchodu s ID {store.id}.
              </p>
            </div>
            <Tabs defaultValue="orders">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="orders">
                <div>Orders</div>
              </TabsContent>
              <TabsContent value="members">
                <div>Members</div>
              </TabsContent>
            </Tabs>
          </div>
        </Suspense>
      </section>
    </>
  );
}
