"use client";

import { StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCustomerDataStore } from "@/store/customer-data-store";
import { useSelectedModalStore } from "@/store/selecte-store-modal";

type Props = {
  mobile?: boolean;
  className?: string;
};

export function OpenStoreModalButton({ mobile = false, className }: Props) {
  const setIsOpen = useSelectedModalStore((state) => state.setIsOpen);
  const customerStore = useCustomerDataStore((state) => state.customerStore);

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <Button
      className={cn(
        mobile
          ? "w-full justify-start gap-3 has-[>svg]:px-3"
          : "hidden w-auto md:inline-flex",
        className
      )}
      onClick={handleClick}
      size={mobile ? "xl" : "sm"}
      type="button"
      variant="outline"
    >
      <StoreIcon className={cn(mobile ? "size-6" : "size-4")} />
      {customerStore ? customerStore.name : "Vybrať predajňu"}
    </Button>
  );
}
