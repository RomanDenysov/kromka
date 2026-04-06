"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import { OrderStorePicker } from "@/components/order-store-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { StoreSchedule } from "@/db/types";
import type { StoreOption } from "@/features/checkout/hooks/use-checkout-form";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getTimeRangeForDate,
} from "@/features/checkout/utils";
import { adminUpdateOrderPickupAction } from "@/features/orders/api/actions";
import type { Store } from "@/features/stores/api/queries";
import { buildFullAddress } from "@/lib/geo-utils";

interface AdminUpdatePickupDialogProps {
  currentPickupDate: string | null;
  currentPickupTime: string | null;
  currentStoreId: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  orderId: string;
  stores: Store[];
}

export function AdminUpdatePickupDialog({
  orderId,
  currentStoreId,
  currentPickupDate,
  currentPickupTime,
  stores,
  open,
  onOpenChange,
}: AdminUpdatePickupDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores.map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address ? buildFullAddress(store.address) : null,
        openingHours: store.openingHours,
        distance: null,
      })),
    [stores]
  );

  const selectedStore = storeOptions.find((s) => s.id === storeId);
  const storeSchedule: StoreSchedule | null =
    selectedStore?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

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
      const result = await adminUpdateOrderPickupAction({
        orderId,
        storeId,
        pickupDate: format(pickupDate, "yyyy-MM-dd"),
        pickupTime,
      });

      if (result.success) {
        toast.success("Vyzdvihnutie bolo zmenene");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Nastala chyba. Skuste to znova.");
    } finally {
      setIsPending(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Zmenit vyzdvihnutie</DialogTitle>
            <DialogDescription>
              Vyberte novu predajnu, datum a cas vyzdvihnutia.
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
            <Button
              disabled={!canSubmit}
              onClick={() => setShowConfirm(true)}
              type="button"
            >
              Ulozit zmeny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setShowConfirm} open={showConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmenit vyzdvihnutie?</AlertDialogTitle>
            <AlertDialogDescription>
              Zakaznik dostane e-mail o zmene vyzdvihnutia objednavky.
              Pokracovat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrusit</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleSubmit}>
              {isPending && <Spinner />}
              Potvrdit zmenu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
