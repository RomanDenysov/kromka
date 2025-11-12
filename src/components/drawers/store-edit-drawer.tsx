"use client";

import { SquareArrowOutUpLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoreEditQuery } from "@/hooks/use-store-edit-query";
import { useStoreParams } from "@/hooks/use-store-params";
import { StoreForm } from "../forms/stores";
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
import { Spinner } from "../ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function StoreEditDrawer() {
  const isMobile = useIsMobile();
  const { storeId, setParams } = useStoreParams();
  const isOpen = Boolean(storeId);

  const { data: store, isLoading, error } = useStoreEditQuery(storeId);

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
        <Separator />
        <div className="size-full flex-1">
          {isLoading || !store ? (
            <Spinner className="size-10 text-muted-foreground" />
          ) : (
            <Tabs defaultValue="form">
              <TabsList className="w-full justify-start rounded-none">
                <TabsTrigger
                  className="w-fit flex-0 rounded-none px-1 py-0"
                  value="form"
                >
                  Store
                </TabsTrigger>
                <TabsTrigger
                  className="w-fit flex-0 rounded-none px-1 py-0"
                  value="members"
                >
                  Zakazníci
                </TabsTrigger>
              </TabsList>
              <div className="size-full flex-1 px-4 py-2">
                <TabsContent value="form">
                  <StoreForm store={store} />
                </TabsContent>
                <TabsContent value="members">
                  <div>Zakazníci</div>
                </TabsContent>
              </div>
            </Tabs>
          )}
          {error && <div className="p-4 text-destructive">{error.message}</div>}
        </div>
        <Separator />
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
