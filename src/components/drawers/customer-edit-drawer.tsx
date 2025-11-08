"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCustomerParams } from "@/hooks/use-customer-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

type UserById = RouterOutputs["admin"]["users"]["byId"];
type UserList = RouterOutputs["admin"]["users"]["list"];

export function CustomerEditDrawer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { customerId, setParams } = useCustomerParams();

  const isOpen = Boolean(customerId);

  const { data: customer } = useQuery(
    trpc.admin.users.byId.queryOptions(
      // biome-ignore lint/style/noNonNullAssertion: customerId is guaranteed to be set
      { id: customerId! },
      {
        enabled: isOpen,
        staleTime: 0,
        initialData: (): UserById | undefined => {
          const users = queryClient
            .getQueriesData({
              queryKey: trpc.admin.users.list.queryOptions().queryKey,
            })
            .flatMap(([_, data]) => (data as UserList) ?? []);
          return users.find((user) => user?.id === customerId);
        },
      }
    )
  );

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upraviť zákazníka</DrawerTitle>
          <DrawerDescription>{customer?.email}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
