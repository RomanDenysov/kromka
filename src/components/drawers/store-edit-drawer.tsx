"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SquareArrowOutUpLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoreParams } from "@/hooks/use-store-params";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Separator } from "../ui/separator";

type StoreById = RouterOutputs["admin"]["stores"]["byId"];
type StoreList = RouterOutputs["admin"]["stores"]["list"];

export function StoreEditDrawer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { storeId, setParams } = useStoreParams();
  const isOpen = Boolean(storeId);

  const { data: store } = useQuery(
    trpc.admin.stores.byId.queryOptions(
      // biome-ignore lint/style/noNonNullAssertion: storeId is guaranteed to be set
      { id: storeId! },
      {
        enabled: isOpen,
        staleTime: 0,
        initialData: (): StoreById | undefined => {
          const stores = queryClient
            .getQueriesData({
              queryKey: trpc.admin.stores.list.queryOptions().queryKey,
            })
            .flatMap(([_, data]) => (data as StoreList) ?? []);
          return stores.find((s) => s?.id === storeId) as StoreById | undefined;
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
          <DrawerTitle>Upraviť obchod</DrawerTitle>
          <DrawerDescription>{store?.name}</DrawerDescription>
        </DrawerHeader>
        <Separator className="my-4" />

        <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button size="sm">Zavrieť</Button>
          </DrawerClose>
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            href={`/admin/stores/${storeId}` as Route}
            prefetch
          >
            <SquareArrowOutUpLeftIcon />
            Otvoriť
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
