"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronsUpDown, StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
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

export function OrderStorePicker({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const trpc = useTRPC();
  const { data: stores } = useQuery(trpc.public.stores.list.queryOptions());

  const processedStores = stores?.map((store) => ({
    label: store.name,
    value: store.id,
  }));

  const selectedStore = processedStores?.find((store) => store.value === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* @ts-ignore */}
        <Button
          className="w-full justify-start"
          role="combobox"
          size="sm"
          variant="outline"
        >
          <StoreIcon />
          {value ? selectedStore?.label : "Vyberte predajňu"}
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput className="h-9" placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>Nenašli sa žiadne predajne.</CommandEmpty>
            <CommandGroup>
              {processedStores?.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onValueChange(store.value)}
                  value={store.value}
                >
                  {store.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      value === store.value ? "opacity-100" : "opacity-0"
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
