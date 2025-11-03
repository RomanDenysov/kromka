"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { usePageTrackerStore } from "react-page-tracker";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function B2CProductsDrawerClientView() {
  const router = useRouter();
  const isFirstPage = usePageTrackerStore((s) => s.isFirstPage);
  const fallbackRoute: Route = "/admin/b2c/products";

  const handleClose = (open: boolean) => {
    if (open) {
      return;
    }
    if (isFirstPage) {
      router.push(fallbackRoute);
    } else {
      router.back();
    }
  };

  return (
    <Drawer direction="right" onOpenChange={handleClose} open={true}>
      <DrawerContent className="w-full min-w-lg">
        <DrawerHeader>
          <DrawerTitle>B2C Products</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
