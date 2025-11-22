"use client";

import {
  ChevronLeftIcon,
  MoreHorizontalIcon,
  SquareArrowOutUpLeftIcon,
  StoreIcon,
  Trash2Icon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { StoreForm } from "@/components/forms/store-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStoreParams } from "@/hooks/use-store-params";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function StoreEditDrawer() {
  const isMobile = useIsMobile();
  const { storeId, setParams } = useStoreParams();
  const isOpen = Boolean(storeId);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  if (!storeId) {
    return null;
  }

  return (
    <>
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        dismissible={false}
        onOpenChange={(open) => !open && setParams(null)}
        open={isOpen}
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-lg">
          <DrawerHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <Button
                  onClick={() => setParams(null)}
                  size="icon-xs"
                  variant="outline"
                >
                  <ChevronLeftIcon />
                </Button>
                <DrawerTitle className="flex flex-row items-center gap-1 rounded-sm border px-2 py-0.5">
                  <span className="font-medium text-sm">Predajňa</span>
                  <StoreIcon className="size-4" />
                </DrawerTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-xs" variant="outline">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/stores/${storeId}` as Route} prefetch>
                      <SquareArrowOutUpLeftIcon />
                      Otvoriť
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
                    <Trash2Icon />
                    Vymazať
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DrawerHeader>
          <Separator />
          <div className="size-full flex-1 overflow-y-auto">
            <Tabs className="size-full" defaultValue="form">
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

              <div className="flex size-full flex-1 flex-col px-4 py-2">
                <TabsContent value="form">
                  <StoreForm id={storeId} />
                </TabsContent>
                <TabsContent value="members">
                  <div>Zakazníci</div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          <Separator />
          <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button size="sm" variant="outline">
                Zavrieť
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <AlertDialog onOpenChange={setOpenDeleteDialog} open={openDeleteDialog}>
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
    </>
  );
}
