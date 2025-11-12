"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCategoryParams } from "@/hooks/use-category-params";
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
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upraviť kategóriu</DrawerTitle>
          <DrawerDescription>{category?.name}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
