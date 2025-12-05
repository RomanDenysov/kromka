"use client";

import { StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  const hasHydrated = useCustomerDataStore((state) => state._hasHydrated);

  const handleClick = () => {
    setIsOpen(true);
  };

  if (!hasHydrated) {
    return (
      <Skeleton
        className={cn(
          mobile ? "h-12 w-full" : "hidden h-8 w-28 md:block",
          className
        )}
      />
    );
  }

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
