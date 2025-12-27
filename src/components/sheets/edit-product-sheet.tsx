"use client";

import { formatDate } from "date-fns";
import { SquareArrowOutUpLeftIcon } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { ProductForm } from "@/app/(admin)/admin/products/[id]/_components/product-form";
import { useProductParams } from "@/hooks/use-product-params";
import type { Category } from "@/lib/queries/categories";
import type { AdminProduct } from "@/lib/queries/products";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Kbd } from "../ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Spinner } from "../ui/spinner";

export function EditProductSheet({
  product,
  categories,
}: {
  product: AdminProduct;
  categories: Category[];
}) {
  const { productId, setParams } = useProductParams();

  const formId = useId();

  if (!productId) {
    return null;
  }

  return (
    <Sheet onOpenChange={(open) => !open && setParams(null)} open>
      <SheetContent className="flex flex-col sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs">
            Upravené: {formatDate(product.updatedAt, "dd.MM.yyyy HH:mm")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <ProductForm
            categories={categories}
            className=""
            formId={formId}
            product={product}
            renderFooter={({ isPending }) => (
              <SheetFooter className="sticky bottom-0 mt-auto flex-row border-t bg-background">
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "ml-auto"
                  )}
                  href={`/admin/products/${productId}`}
                >
                  <SquareArrowOutUpLeftIcon />
                  Otvoriť
                </Link>
                <Button
                  disabled={isPending}
                  form={formId}
                  size="sm"
                  type="submit"
                >
                  Uložiť
                  {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
                </Button>
              </SheetFooter>
            )}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
