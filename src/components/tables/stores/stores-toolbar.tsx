import { PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { Toolbar } from "@/components/shared/toolbar";
import { ToolbarButton } from "@/components/shared/toolbar-button";
import { useCreateDraftStore } from "@/hooks/use-create-draft-store";

export function StoresToolbar() {
  const { mutate: createDraftStore, isPending: isCreatingDraftStore } =
    useCreateDraftStore();

  const handleCreateDraftStore = useCallback(
    () => createDraftStore(),
    [createDraftStore]
  );

  const toolbarItems = [
    {
      icon: PlusIcon,
      label: "Pridať obchod",
      loading: isCreatingDraftStore,
      onClick: handleCreateDraftStore,
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
