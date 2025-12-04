"use client";

import { StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerDataStore } from "@/store/customer-data-store";
import { useSelectedModalStore } from "@/store/selecte-store-modal";

export function OpenStoreModalButton() {
  const setIsOpen = useSelectedModalStore((state) => state.setIsOpen);
  const customerStore = useCustomerDataStore((state) => state.customerStore);

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <Button onClick={handleClick} type="button" variant="outline">
      <StoreIcon />
      {customerStore ? customerStore.name : "Vybrať predajňu"}
    </Button>
  );
}
