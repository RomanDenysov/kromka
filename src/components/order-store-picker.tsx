"use client";

import { CheckIcon, ChevronsUpDown, MapPinIcon } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DistanceBadge } from "@/components/ui/distance-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { StoreSchedule } from "@/db/types";
import { cn } from "@/lib/utils";
import { getOpeningHoursLabel } from "@/lib/working-time-formatter";

export type StoreOption = {
  id: string;
  name: string;
  openingHours: StoreSchedule | null;
  address: string | null;
  distance?: number | null;
};

type OrderStorePickerProps = {
  value: string;
  onValueChange: (storeId: string) => void;
  storeOptions: StoreOption[];
};

const hasDistance = (distance?: number | null) =>
  distance !== null &&
  distance !== undefined &&
  distance !== Number.POSITIVE_INFINITY;

export function OrderStorePicker({
  value,
  onValueChange,
  storeOptions,
}: OrderStorePickerProps) {
  const selectedStore = storeOptions.find((store) => store.id === value);
  const selectedOpeningHours = getOpeningHoursLabel(
    selectedStore?.openingHours ?? null
  );

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
          className="h-auto w-full justify-between rounded-sm bg-transparent px-3 py-2.5 hover:bg-accent"
          role="combobox"
          variant="outline"
        >
          <div className="flex items-start gap-2.5 text-left">
            <MapPinIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            {value ? (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">
                    {selectedStore?.name}
                  </div>
                  {hasDistance(selectedStore?.distance) && (
                    <DistanceBadge
                      className="shrink-0"
                      distance={selectedStore?.distance ?? 0}
                      variant="light"
                    />
                  )}
                </div>
                {selectedStore?.address && (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {selectedStore?.address}
                  </div>
                )}
                {selectedOpeningHours && (
                  <div className="mt-0.5 text-muted-foreground text-xs">
                    {selectedOpeningHours}
                  </div>
                )}
              </div>
            ) : (
              <span className="truncate">Vyberte predajňu</span>
            )}
          </div>
          <ChevronsUpDown className="ml-auto opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput className="h-9" placeholder="Hľadať predajňu..." />
          <CommandList>
            <CommandEmpty>Nenašli sa žiadne predajne.</CommandEmpty>
            <CommandGroup>
              {storeOptions.map((store) => {
                const openingHoursLabel = getOpeningHoursLabel(
                  store.openingHours
                );
                const searchValue = [
                  store.name,
                  store.address,
                  openingHoursLabel,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <CommandItem
                    className="flex items-center gap-3 rounded-sm"
                    key={store.id}
                    onSelect={() => handleSelect(store.id)}
                    value={searchValue}
                  >
                    <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm">{store.name}</div>
                      {store.address && (
                        <div className="mt-0.5 text-muted-foreground text-xs">
                          {store.address}
                        </div>
                      )}
                      {openingHoursLabel && (
                        <div className="mt-0.5 text-muted-foreground text-xs">
                          {openingHoursLabel}
                        </div>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {hasDistance(store.distance) && (
                        <DistanceBadge
                          distance={store.distance ?? 0}
                          variant="light"
                        />
                      )}
                      <CheckIcon
                        className={cn(
                          value === store.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
