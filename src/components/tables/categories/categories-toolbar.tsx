import { PackagePlusIcon, PlusIcon } from "lucide-react";
import { Toolbar } from "@/components/shared/toolbar";
import { ToolbarButton } from "@/components/shared/toolbar-button";
import { useCreateDraftCategory } from "@/features/b2c/category-management/hooks/use-categories-mutations";
import { useCreateDraftProduct } from "@/features/b2c/product-management/hooks/use-product-mutations";

export function CategoriesToolbar() {
  const { mutate: createDraftProduct, isPending: isCreatingDraftProduct } =
    useCreateDraftProduct();
  const { mutate: createDraftCategory, isPending: isCreatingDraftCategory } =
    useCreateDraftCategory();

  const toolbarItems = [
    {
      icon: PlusIcon,
      label: "Pridať kategóriu",
      loading: isCreatingDraftCategory,
      onClick: () => createDraftCategory(),
    },
    {
      icon: PackagePlusIcon,
      label: "Pridať produkt",
      loading: isCreatingDraftProduct,
      onClick: () => createDraftProduct(),
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
