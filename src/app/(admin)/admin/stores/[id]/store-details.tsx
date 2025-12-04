import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Store } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";

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

type Props = {
  store: Store;
  className?: string;
};

export function StoreDetails({ store, className }: Props) {
  return (
    <div className={cn("flex w-full flex-0 flex-col gap-4", className)}>
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
          <OrdersTable id={store.id} />
        </TabsContent>
        <TabsContent value="members">
          <MembersTable id={store.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrdersTable({ id }: { id: string }) {
  return <div>OrdersTable {id}</div>;
}

function MembersTable({ id }: { id: string }) {
  return <div>MembersTable {id}</div>;
}
