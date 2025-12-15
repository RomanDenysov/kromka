"use client";

import { SquareArrowOutUpLeftIcon } from "lucide-react";
import { refresh } from "next/cache";
import Form from "next/form";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProductParams } from "@/hooks/use-product-params";
import { updateProductAction } from "@/lib/actions/products";
import { cn } from "@/lib/utils";
import { updateProductSchema } from "@/validation/products";
import { FormSubmitButton } from "../shared/form-submit-button";
import { buttonVariants } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

async function updateProductFormAction(formData: FormData, id: string) {
  const rawFormData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    isActive: formData.get("isActive"),
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
    showInB2c: formData.get("showInB2c"),
    showInB2b: formData.get("showInB2b"),
    priceCents: formData.get("priceCents"),
    categoryId: formData.get("categoryId"),
  };
  const product = updateProductSchema.parse(rawFormData);
  await updateProductAction({ id, product });

  refresh();
}

export function ProductEditDrawer() {
  const isMobile = useIsMobile();
  const { productId, setParams } = useProductParams();

  const isOpen = Boolean(productId);

  if (!productId) {
    return null;
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      onOpenChange={(open) => !open && setParams(null)}
      open={isOpen}
    >
      <Form
        action={(formData) => updateProductFormAction(formData, productId)}
        id="product-edit-form"
      >
        <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
          <DrawerHeader className="border-b">
            <DrawerTitle>Upraviť produkt</DrawerTitle>
            <DrawerDescription>{productId}</DrawerDescription>
          </DrawerHeader>
          <div className="flex-1" />
          <DrawerFooter className="flex-row border-t">
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "ml-auto"
              )}
              href={`/admin/products/${productId}`}
              prefetch
            >
              <SquareArrowOutUpLeftIcon />
              Otvoriť
            </Link>
            <FormSubmitButton formId="product-edit-form" />
          </DrawerFooter>
        </DrawerContent>
      </Form>
    </Drawer>
  );
}
