"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import type { Allergen } from "@/features/allergens/api/queries";
import type { Category } from "@/features/categories/api/queries";
import type { AdminProduct } from "@/features/products/api/queries";
import { ProductForm } from "./_components/product-form";

interface Props {
  allergens: Allergen[];
  categories: Category[];
  product: AdminProduct;
}

export function FormContainer({ categories, allergens, product }: Props) {
  const formId = useId();
  return (
    <ProductForm
      allergens={allergens}
      categories={categories}
      formId={formId}
      product={product}
      renderFooter={({ isPending }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            disabled={isPending}
            form="product-form"
            size="sm"
            type="submit"
          >
            Uložiť
            {isPending ? <Spinner /> : <Kbd>↵</Kbd>}
          </Button>
        </div>
      )}
    />
  );
}
