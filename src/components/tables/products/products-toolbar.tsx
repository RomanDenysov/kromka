"use client";

import { PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { Toolbar } from "@/components/shared/toolbar";
import { ToolbarButton } from "@/components/shared/toolbar-button";
import { useCreateDraftProduct } from "@/features/b2c/product-management/hooks/use-product-mutations";

export function ProductsToolbar() {
  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();

  const handleCreateDraftProduct = useCallback(
    () => createDraftProduct(),
    [createDraftProduct]
  );

  const toolbarItems = [
    {
      icon: PlusIcon,
      label: "Pridať produkt",
      loading: isCreatingDraftProduct,
      onClick: handleCreateDraftProduct,
    },
  ];

  return (
    <Toolbar>
      {toolbarItems.map((item) => (
        <ToolbarButton key={item.label} {...item} />
      ))}
    </Toolbar>
  );
}
