"use client";

import { StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelectedStore } from "@/stores/selected-store";

export function OpenStoreModalButton() {
  const selectedStore = useSelectedStore((state) => state.store);
  const setModalOpen = useSelectedStore((state) => state.setModalOpen);

  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <Button onClick={handleClick} type="button" variant="outline">
      <StoreIcon />
      {selectedStore ? selectedStore.name : "Vybrať predajňu"}
    </Button>
  );
}
