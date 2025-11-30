"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  id: string;
  className?: string;
};

export function StoreDetails({ id, className }: Props) {
  return (
    <div className={cn("flex w-full flex-0 flex-col gap-4", className)}>
      <div>
        <h2 className="font-semibold text-lg tracking-tight">
          Detaily obchodu
        </h2>
        <p className="text-muted-foreground text-sm">
          Zobrazujú sa detaily obchodu s ID {id}.
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
          <OrdersTable id={id} />
        </TabsContent>
        <TabsContent value="members">
          <MembersTable id={id} />
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
