"use client";

import { format } from "date-fns";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { usePageTrackerStore } from "react-page-tracker";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useGetSuspenseProductById } from "@/features/b2c/product-management/hooks/use-products-queries";

export default function B2CProductsDrawerClientView() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useGetSuspenseProductById(id);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    handleClose(true);
    return null;
  }

  return (
    <Drawer direction="right" onOpenChange={handleClose} open={true}>
      <DrawerContent className="w-full min-w-lg">
        <DrawerHeader>
          <DrawerTitle>{product.name}</DrawerTitle>
          <DrawerDescription>
            <Badge className="mr-2" size="xs" variant="outline">
              Vytvorený: {format(product.createdAt, "dd.MM.yyyy HH:mm")}
            </Badge>
            <Badge size="xs" variant="outline">
              Upravený: {format(product.updatedAt, "dd.MM.yyyy HH:mm")}
            </Badge>
          </DrawerDescription>
        </DrawerHeader>
        <Separator />
      </DrawerContent>
    </Drawer>
  );
}
