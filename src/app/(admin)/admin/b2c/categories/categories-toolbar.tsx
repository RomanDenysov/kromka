"use client";

import { PackagePlusIcon, PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useCreateDraftProduct } from "@/features/b2c/product-management/hooks/use-product-mutations";

export function CategoriesToolbar() {
  const { mutateAsync: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const handleCreateDraftProduct = useCallback(async () => {
    await createDraftProduct();
  }, [createDraftProduct]);
  return (
    <div className="flex items-center gap-2">
      <Button disabled={isCreatingDraftProduct} size="xs" variant="outline">
        <PlusIcon />
        Pridať kategóriu
      </Button>

      <Button
        disabled={isCreatingDraftProduct}
        onClick={handleCreateDraftProduct}
        size="xs"
        variant="outline"
      >
        <PackagePlusIcon />
        Pridať produkt
      </Button>
    </div>
  );
}
