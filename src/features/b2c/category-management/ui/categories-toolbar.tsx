"use client";

import { PackagePlusIcon, PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { Toolbar } from "@/components/admin-header/toolbar";
import { ToolbarButton } from "@/components/admin-header/toolbar-button";
import { useCreateDraftProduct } from "@/features/b2c/product-management/hooks/use-product-mutations";

export function CategoriesToolbar() {
  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const handleCreateDraftProduct = useCallback(
    () => createDraftProduct(),
    [createDraftProduct]
  );

  return (
    <Toolbar>
      <ToolbarButton
        icon={PlusIcon}
        label="Pridať kategóriu"
        loading={isCreatingDraftProduct}
        onClick={handleCreateDraftProduct}
      />
      <ToolbarButton
        icon={PackagePlusIcon}
        label="Pridať produkt"
        loading={isCreatingDraftProduct}
        onClick={handleCreateDraftProduct}
      />
    </Toolbar>
  );
}
