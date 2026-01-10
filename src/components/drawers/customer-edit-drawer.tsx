"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCustomerParams } from "@/hooks/use-customer-params";
import { useIsMobile } from "@/hooks/use-mobile";

export function CustomerEditDrawer() {
  const isMobile = useIsMobile();
  const { customerId, setParams } = useCustomerParams();

  const isOpen = Boolean(customerId);

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Upraviť zákazníka</DrawerTitle>
          <DrawerDescription>{customerId}</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
