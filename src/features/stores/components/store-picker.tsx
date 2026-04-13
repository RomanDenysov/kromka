"use client";

import { startOfToday } from "date-fns";
import { CheckIcon, Clock, Navigation, StoreIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
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
import type { TimeRange } from "@/db/types";
import {
  getTimeRangeForDate,
  parseTimeToMinutes,
} from "@/features/checkout/utils";
import type { Store } from "@/features/stores/api/queries";
import { cn } from "@/lib/utils";

type StoreWithDistance = Store & { distance: number | null };

const getTodaySchedule = (openingHours: Store["openingHours"]) => {
  if (!openingHours) {
    return null;
  }
  return getTimeRangeForDate(startOfToday(), openingHours);
};

const isCurrentlyOpen = (schedule: TimeRange | null): boolean => {
  if (!schedule) {
    return false;
  }
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    currentMinutes >= parseTimeToMinutes(schedule.start) &&
    currentMinutes < parseTimeToMinutes(schedule.end)
  );
};

const formatTimeRange = (schedule: TimeRange | null) => {
  if (!schedule) {
    return "Zatvorene";
  }
  return `${schedule.start} - ${schedule.end}`;
};

interface StorePickerProps {
  onSelect: (storeId: string) => void;
  selectedStoreId: string;
  stores: StoreWithDistance[];
}

export function StorePicker({
  stores,
  selectedStoreId,
  onSelect,
}: StorePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (storeId: string) => {
      onSelect(storeId);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-auto w-full justify-center gap-1.5 px-2 py-1 text-muted-foreground text-xs hover:text-foreground"
          role="combobox"
          size="sm"
          variant="ghost"
        >
          <Navigation className="size-3" />
          Zmeniť predajňu
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        avoidCollisions={false}
        className="w-80 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
        side="top"
        sideOffset={8}
      >
        <Command>
          <CommandInput className="h-9" placeholder="Hľadať predajňu..." />
          <CommandList className="max-h-72">
            <CommandEmpty>Žiadne predajne.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => {
                const todaySchedule = getTodaySchedule(store.openingHours);
                const storeOpen = isCurrentlyOpen(todaySchedule);
                const isActive = store.id === selectedStoreId;

                return (
                  <CommandItem
                    className="flex items-center gap-3 py-2.5"
                    key={store.id}
                    onSelect={() => handleSelect(store.id)}
                    value={[
                      store.name,
                      store.address?.city,
                      store.address?.street,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {/* Thumbnail */}
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {store.image?.url ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="40px"
                          src={store.image.url}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <StoreIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-sm">
                          {store.name}
                        </span>
                        <div
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            storeOpen ? "bg-green-500" : "bg-neutral-400"
                          )}
                        />
                      </div>
                      {store.address && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                          <StoreIcon className="size-3 shrink-0" />
                          <span className="truncate">
                            {[store.address.street, store.address.city]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Clock className="size-3 shrink-0" />
                        <span>Dnes: {formatTimeRange(todaySchedule)}</span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      {store.distance !== null &&
                        Number.isFinite(store.distance) && (
                          <DistanceBadge
                            distance={store.distance}
                            variant="light"
                          />
                        )}
                      <CheckIcon
                        className={cn(
                          "size-4",
                          isActive ? "opacity-100" : "opacity-0"
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
