"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import { OrderStorePicker } from "@/components/order-store-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { StoreSchedule } from "@/db/types";
import type { StoreOption } from "@/features/checkout/hooks/use-checkout-form";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getTimeRangeForDate,
} from "@/features/checkout/utils";
import { updateOrderPickupAction } from "@/features/orders/api/actions";
import type { Store } from "@/features/stores/api/queries";
import { useGeolocation } from "@/hooks/use-geolocation";
import { buildFullAddress, sortStoresByDistance } from "@/lib/geo-utils";

interface UpdatePickupDialogProps {
  currentPickupDate: string | null;
  currentPickupTime: string | null;
  currentStoreId: string | null;
  orderId: string;
  stores: Store[];
}

export function UpdatePickupDialog({
  orderId,
  currentStoreId,
  currentPickupDate,
  currentPickupTime,
  stores,
}: UpdatePickupDialogProps) {
  const router = useRouter();
  const { position } = useGeolocation();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const [storeId, setStoreId] = useState(currentStoreId ?? "");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    currentPickupDate ? new Date(currentPickupDate) : undefined
  );
  const [pickupTime, setPickupTime] = useState(currentPickupTime ?? "");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStoreId(currentStoreId ?? "");
      setPickupDate(
        currentPickupDate ? new Date(currentPickupDate) : undefined
      );
      setPickupTime(currentPickupTime ?? "");
    }
  }, [open, currentStoreId, currentPickupDate, currentPickupTime]);

  const storeOptions: StoreOption[] = useMemo(() => {
    if (!position) {
      return stores.map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address ? buildFullAddress(store.address) : null,
        openingHours: store.openingHours,
        distance: null,
      }));
    }

    return sortStoresByDistance(
      stores,
      position.latitude,
      position.longitude
    ).map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address ? buildFullAddress(s.address) : null,
      openingHours: s.openingHours,
      distance: s.distance ?? null,
    }));
  }, [stores, position]);

  const selectedStore = storeOptions.find((s) => s.id === storeId);
  const storeSchedule: StoreSchedule | null =
    selectedStore?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

  // When store changes, reset date and time
  const handleStoreChange = useCallback(
    (newStoreId: string) => {
      setStoreId(newStoreId);
      const store = storeOptions.find((s) => s.id === newStoreId);
      const schedule = store?.openingHours ?? null;
      const firstDate = getFirstAvailableDateWithRestrictions(schedule, null);

      if (firstDate) {
        setPickupDate(firstDate);
        const range = getTimeRangeForDate(firstDate, schedule);
        setPickupTime(getFirstAvailableTime(range));
      } else {
        setPickupDate(undefined);
        setPickupTime("");
      }
    },
    [storeOptions]
  );

  // When date changes, reset time
  const handleDateChange = useCallback(
    (newDate: Date) => {
      setPickupDate(newDate);
      const range = getTimeRangeForDate(newDate, storeSchedule);
      setPickupTime(getFirstAvailableTime(range));
    },
    [storeSchedule]
  );

  const canSubmit = storeId && pickupDate && pickupTime && !isPending;

  const handleSubmit = async () => {
    if (!pickupDate) {
      return;
    }

    setIsPending(true);
    try {
      const result = await updateOrderPickupAction({
        orderId,
        storeId,
        pickupDate: format(pickupDate, "yyyy-MM-dd"),
        pickupTime,
      });

      if (result.success) {
        toast.success("Vyzdvihnutie bolo zmenené");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Nastala chyba. Skúste to znova.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Zmeniť vyzdvihnutie
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Zmeniť vyzdvihnutie</DialogTitle>
          <DialogDescription>
            Vyberte novú predajňu, dátum a čas vyzdvihnutia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <OrderStorePicker
            onValueChange={handleStoreChange}
            storeOptions={storeOptions}
            value={storeId}
          />

          <div className="grid grid-cols-2 gap-4">
            <OrderPickupDatePicker
              onDateSelect={handleDateChange}
              selectedDate={pickupDate}
              storeSchedule={storeSchedule}
            />
            <OrderPickupTimePicker
              disabled={!pickupDate}
              onTimeSelect={setPickupTime}
              selectedTime={pickupTime}
              timeRange={timeRange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!canSubmit} onClick={handleSubmit} type="button">
            {isPending && <Spinner />}
            Uložiť zmeny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
