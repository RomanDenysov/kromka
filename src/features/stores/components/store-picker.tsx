"use client";

import { startOfToday } from "date-fns";
import { CheckIcon, Clock, Navigation, StoreIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DistanceBadge } from "@/components/ui/distance-badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TimeRange } from "@/db/types";
import {
  getTimeRangeForDate,
  parseTimeToMinutes,
} from "@/features/checkout/utils";
import type { Store } from "@/features/stores/api/queries";
import { formatStreetCity } from "@/lib/geo-utils";
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return stores;
    }
    return stores.filter((store) => {
      const haystack = [store.name, store.address?.street, store.address?.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [stores, query]);

  const handleSelect = useCallback(
    (storeId: string) => {
      onSelect(storeId);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <>
      <Button
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-auto min-h-11 w-full min-w-0 shrink rounded-none rounded-b-md px-3 py-2.5 text-muted-foreground text-xs hover:text-foreground"
        onClick={() => setOpen(true)}
        type="button"
        variant="ghost"
      >
        <Navigation className="size-3.5 shrink-0" />
        Zmeniť predajňu
      </Button>

      <ResponsiveModal
        onOpenChange={setOpen}
        open={open}
        subtitle="Vyhľadajte podľa názvu alebo adresy."
        title="Vyberte predajňu"
      >
        <div className="flex flex-col gap-3 px-4 pb-4 sm:px-2">
          <Input
            aria-label="Hľadať predajňu"
            className="h-9 touch-manipulation"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hľadať predajňu…"
            value={query}
          />
          <ScrollArea className="h-[min(65dvh,22rem)] sm:h-72">
            <div className="flex flex-col gap-1 pr-3">
              {filteredStores.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground text-sm">
                  Žiadne predajne.
                </p>
              ) : (
                filteredStores.map((store) => {
                  const todaySchedule = getTodaySchedule(store.openingHours);
                  const storeOpen = isCurrentlyOpen(todaySchedule);
                  const isActive = store.id === selectedStoreId;

                  return (
                    <button
                      className={cn(
                        "flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors duration-150 ease-out motion-reduce:duration-0",
                        "hover:bg-muted/80 active:bg-muted",
                        isActive && "border bg-muted/60"
                      )}
                      key={store.id}
                      onClick={() => handleSelect(store.id)}
                      type="button"
                    >
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
                        {store.address ? (
                          <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                            <StoreIcon className="size-3 shrink-0" />
                            <span className="truncate">
                              {formatStreetCity(store.address)}
                            </span>
                          </div>
                        ) : null}
                        <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Clock className="size-3 shrink-0" />
                          <span>Dnes: {formatTimeRange(todaySchedule)}</span>
                        </div>
                      </div>

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
                            "size-4 shrink-0",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </ResponsiveModal>
    </>
  );
}
