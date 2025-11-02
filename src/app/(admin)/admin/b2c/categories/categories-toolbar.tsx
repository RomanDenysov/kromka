"use client";

import { PackagePlusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDraftCategory } from "@/features/b2c/category-management/actions/create-draft-category";
import { createDraftProduct } from "@/features/b2c/product-management/actions/create-draft-product";

export function CategoriesToolbar() {
  return (
    <div className="flex items-center gap-2">
      <form action={createDraftCategory} id="add-category-form">
        <Button
          form="add-category-form"
          size="xs"
          type="submit"
          variant="outline"
        >
          <PlusIcon />
          Pridať kategóriu
        </Button>
      </form>
      <form action={createDraftProduct} id="add-product-form">
        <Button
          form="add-product-form"
          size="xs"
          type="submit"
          variant="outline"
        >
          <PackagePlusIcon />
          Pridať produkt
        </Button>
      </form>
    </div>
  );
}
