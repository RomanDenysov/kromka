import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, startOfToday } from "date-fns";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { PaymentMethod, StoreSchedule } from "@/db/types";
import {
  type CheckoutFormData,
  checkoutFormSchema,
} from "@/features/checkout/schema";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getTimeRangeForDate,
  isBeforeDailyCutoff,
} from "@/features/checkout/utils";
import {
  createOrderFromCart,
  type GuestCustomerInfo,
} from "@/features/orders/actions";
import type { Store } from "@/features/stores/queries";
import type { User } from "@/lib/auth/session";
import { buildFullAddress } from "@/lib/geo-utils";
import type { LastOrderPrefill } from "../actions";

export type StoreOption = {
  id: string;
  name: string;
  openingHours: StoreSchedule | null;
  address: string | null;
  distance: number | null;
};

type StoreWithDistance = Store & { distance?: number | null };

type UseCheckoutFormProps = {
  user?: User;
  stores: Store[];
  lastOrderPrefill?: LastOrderPrefill | null;
  restrictedPickupDates: Set<string> | null;
};

/**
 * Hook to manage checkout form state, effects, and submission.
 * Handles store selection, date/time coordination, and order creation.
 */
export function useCheckoutForm({
  user,
  stores,
  lastOrderPrefill,
  restrictedPickupDates,
}: UseCheckoutFormProps) {
  const router = useRouter();

  // Transform stores to options with schedule
  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores.map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address ? buildFullAddress(store.address) : null,
        openingHours: store.openingHours,
        distance: (store as StoreWithDistance).distance ?? null,
      })),
    [stores]
  );

  // Compute initial form values with customer info prefilled
  const initialValues = useMemo(() => {
    const canOrderForTomorrow = isBeforeDailyCutoff();
    const defaultDate = canOrderForTomorrow
      ? addDays(startOfToday(), 1)
      : addDays(startOfToday(), 2);

    // Prefill customer info: user data first, then last order fallback
    const customerName =
      user?.name ?? lastOrderPrefill?.customerInfo?.name ?? "";
    const customerEmail =
      user?.email ?? lastOrderPrefill?.customerInfo?.email ?? "";
    const customerPhone =
      user?.phone ?? lastOrderPrefill?.customerInfo?.phone ?? "";

    return {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      paymentMethod: "in_store" as PaymentMethod,
      pickupDate: defaultDate,
      pickupTime: "",
      storeId: lastOrderPrefill?.storeId ?? "",
    };
  }, [user, lastOrderPrefill]);

  // Initialize form with onChange validation mode for real-time feedback
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  // Watch form values for derived state
  const pickupDate = form.watch("pickupDate");
  const storeId = form.watch("storeId");

  // Derive selected store and schedule from form value
  const selectedStoreInForm =
    storeOptions.find((s) => s.id === storeId) ?? null;
  const storeSchedule = selectedStoreInForm?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

  // Check if there are no available dates for selected store
  const hasNoAvailableDates = useMemo(() => {
    if (!selectedStoreInForm) {
      return false;
    }
    const schedule = selectedStoreInForm.openingHours;
    const firstAvailableDate = getFirstAvailableDateWithRestrictions(
      schedule,
      restrictedPickupDates
    );
    return (
      !firstAvailableDate ||
      (restrictedPickupDates !== null && restrictedPickupDates.size === 0)
    );
  }, [selectedStoreInForm, restrictedPickupDates]);

  // Effect: When store changes, update date and time to first available
  useEffect(() => {
    if (!storeId) {
      return;
    }

    const store = storeOptions.find((s) => s.id === storeId);
    const schedule = store?.openingHours ?? null;

    const firstDate = getFirstAvailableDateWithRestrictions(
      schedule,
      restrictedPickupDates
    );

    if (firstDate) {
      form.setValue("pickupDate", firstDate, { shouldValidate: true });
      const range = getTimeRangeForDate(firstDate, schedule);
      const firstTime = getFirstAvailableTime(range);
      if (firstTime) {
        form.setValue("pickupTime", firstTime, { shouldValidate: true });
      }
    } else {
      form.setValue("pickupTime", "", { shouldValidate: true });
    }
  }, [storeId, storeOptions, restrictedPickupDates, form]);

  // Effect: When date changes independently, update time
  const prevPickupDateRef = useRef(pickupDate);
  useEffect(() => {
    // Skip if date hasn't actually changed (prevents double-set from storeId effect)
    if (prevPickupDateRef.current === pickupDate) {
      return;
    }
    prevPickupDateRef.current = pickupDate;

    if (!pickupDate) {
      form.setValue("pickupTime", "", { shouldValidate: true });
      return;
    }

    const range = getTimeRangeForDate(pickupDate, storeSchedule);
    const firstTime = getFirstAvailableTime(range);
    if (firstTime) {
      form.setValue("pickupTime", firstTime, { shouldValidate: true });
    }
  }, [pickupDate, storeSchedule, form]);

  // Form submission handler
  const onSubmit = async (value: CheckoutFormData) => {
    const formattedDate = format(value.pickupDate, "yyyy-MM-dd");

    // Build customer info from form values (for all users, including authenticated)
    const customerInfo: GuestCustomerInfo = {
      name: value.name,
      email: value.email,
      phone: value.phone,
    };

    const result = await createOrderFromCart({
      storeId: value.storeId,
      pickupDate: formattedDate,
      pickupTime: value.pickupTime,
      paymentMethod: value.paymentMethod,
      customerInfo,
    });

    if (result.success) {
      toast.success("Vaša objednávka bola vytvorená");
      router.push(`/pokladna/${result.orderId}` as Route);
    } else {
      toast.error(result.error ?? "Nepodarilo sa vytvoriť objednávku");
    }
  };

  return {
    form,
    storeOptions,
    selectedStoreInForm,
    storeSchedule,
    timeRange,
    pickupDate,
    hasNoAvailableDates,
    onSubmit,
  };
}
