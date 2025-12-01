"use client";

import { CheckIcon, ChevronsUpDown, StoreIcon } from "lucide-react";
import { useCallback } from "react";
import type { StoreSchedule } from "@/db/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type StoreOption = {
  id: string;
  name: string;
  openingHours: StoreSchedule | null;
};

type OrderStorePickerProps = {
  value: string;
  onValueChange: (storeId: string) => void;
  storeOptions: StoreOption[];
};

export function OrderStorePicker({
  value,
  onValueChange,
  storeOptions,
}: OrderStorePickerProps) {
  const selectedStore = storeOptions.find((store) => store.id === value);

  const handleSelect = useCallback(
    (storeId: string) => {
      onValueChange(storeId);
    },
    [onValueChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-start"
          role="combobox"
          size="sm"
          variant="outline"
        >
          <StoreIcon />
          <span className="truncate">
            {value ? selectedStore?.name : "Vyberte predajňu"}
          </span>
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput className="h-9" placeholder="Hľadať predajňu..." />
          <CommandList>
            <CommandEmpty>Nenašli sa žiadne predajne.</CommandEmpty>
            <CommandGroup>
              {storeOptions.map((store) => (
                <CommandItem
                  key={store.id}
                  onSelect={() => handleSelect(store.id)}
                  value={store.id}
                >
                  {store.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === store.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
