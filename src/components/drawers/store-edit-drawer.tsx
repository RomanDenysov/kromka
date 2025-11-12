"use client";

import { SquareArrowOutUpLeftIcon, Trash2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoreEditQuery } from "@/hooks/use-store-edit-query";
import { useStoreParams } from "@/hooks/use-store-params";
import { StoreForm } from "../forms/stores";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button, buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log(store);
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log(store?.createdBy);
  }, [store]);

  if (!store) {
    return null;
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-lg">
        <DrawerHeader>
          <div className="flex flex-row items-center justify-between">
            <DrawerTitle>Upraviť obchod</DrawerTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon-xs" variant="destructive">
                  <Trash2Icon />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Odstrániť obchod</AlertDialogTitle>
                  <AlertDialogDescription>
                    Opravdu chcete odstrániť obchod? Táto akcia je nevratná.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel size="sm">Zrušiť</AlertDialogCancel>
                  <AlertDialogAction size="sm" variant="destructive">
                    Odstrániť
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DrawerHeader>
        <Separator />
        <div className="size-full flex-1">
          {isLoading || !store ? (
            <Spinner className="size-10 text-muted-foreground" />
          ) : (
            <Tabs defaultValue="form">
              <TabsList className="w-full justify-start rounded-none">
                <TabsTrigger
                  className="w-fit flex-0 rounded-sm px-1 py-0"
                  value="form"
                >
                  Obchod
                </TabsTrigger>
                <TabsTrigger
                  className="w-fit flex-0 rounded-sm px-1 py-0"
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
            <Button size="sm" variant="outline">
              Zavrieť
            </Button>
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
