"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useProductParams } from "@/hooks/use-product-params";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

export function ProductEditDrawer() {
  const isMobile = useIsMobile();
  const { productId, setParams } = useProductParams();

  const isOpen = Boolean(productId);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upraviť produkt</DrawerTitle>
          <DrawerDescription>{productId}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
