"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SquareArrowOutUpLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCategoryParams } from "@/hooks/use-category-params";
import { useIsMobile } from "@/hooks/use-mobile";
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

type CategoryById = RouterOutputs["admin"]["categories"]["byId"];
type CategoryList = RouterOutputs["admin"]["categories"]["list"];

export function CategoryEditDrawer() {
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { categoryId, setParams } = useCategoryParams();
  const isOpen = Boolean(categoryId);

  const { data: category } = useQuery(
    trpc.admin.categories.byId.queryOptions(
      // biome-ignore lint/style/noNonNullAssertion: categoryId is guaranteed to be set
      { id: categoryId! },
      {
        enabled: isOpen,
        staleTime: 0,
        initialData: (): CategoryById | undefined => {
          const categories = queryClient
            .getQueriesData({
              queryKey: trpc.admin.categories.list.queryOptions().queryKey,
            })
            .flatMap(([_, data]) => (data as CategoryList) ?? []);
          const found = categories.find((c) => c?.id === categoryId);
          return found as CategoryById | undefined;
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
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Upraviť kategóriu</DrawerTitle>
          <DrawerDescription>{category?.name}</DrawerDescription>
        </DrawerHeader>
        <Separator />
        <div className="flex-1" />
        <Separator />
        <DrawerFooter className="gap-2 sm:flex-row sm:justify-end">
          <DrawerClose asChild>
            <Button size="sm" variant="outline">
              Zavrieť
            </Button>
          </DrawerClose>
          <Link
            className={buttonVariants({ size: "sm" })}
            href={`categories/${categoryId}` as Route}
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
