"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProductParams } from "@/hooks/use-product-params";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/routers";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

type ProductById = RouterOutputs["admin"]["products"]["byId"];
type ProductList = RouterOutputs["admin"]["products"]["list"];

export function ProductEditDrawer() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { productId, setParams } = useProductParams();

  const isOpen = Boolean(productId);

  const { data: product } = useQuery(
    trpc.admin.products.byId.queryOptions(
      // biome-ignore lint/style/noNonNullAssertion: productId is guaranteed to be set
      { id: productId! },
      {
        enabled: isOpen,
        staleTime: 0,
        initialData: (): ProductById | undefined => {
          const products = queryClient
            .getQueriesData({
              queryKey: trpc.admin.products.list.queryOptions().queryKey,
            })
            .flatMap(([_, data]) => (data as ProductList) ?? []);
          const found = products.find((p) => p?.id === productId);
          // Cast to ProductById - channels will be fetched by the query
          return found as ProductById | undefined;
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
          <DrawerTitle>Upraviť produkt</DrawerTitle>
          <DrawerDescription>{product?.name}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
