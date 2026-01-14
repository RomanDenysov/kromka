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
import { type LastOrderPrefill, setLastOrderIdAction } from "../actions";

export type StoreOption = {
  id: string;
  name: string;
  openingHours: StoreSchedule | null;
};

type UseCheckoutFormProps = {
  user?: User;
  stores: Store[];
  lastOrderPrefill?: LastOrderPrefill | null;
  restrictedPickupDates: Set<string> | null;
  userInfo: { name: string; email: string; phone: string };
  isUserInfoValid: boolean;
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
  userInfo,
  isUserInfoValid,
}: UseCheckoutFormProps) {
  const router = useRouter();

  // Transform stores to options with schedule
  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores?.map((store) => ({
        id: store.id,
        name: store.name,
        openingHours: store.openingHours,
      })) ?? [],
    [stores]
  );

  // Compute initial form values
  const initialValues = useMemo(() => {
    const canOrderForTomorrow = isBeforeDailyCutoff();
    const defaultDate = canOrderForTomorrow
      ? addDays(startOfToday(), 1)
      : addDays(startOfToday(), 2);

    return {
      paymentMethod: "in_store" as PaymentMethod,
      pickupDate: defaultDate,
      pickupTime: "",
      storeId: lastOrderPrefill?.storeId ?? "",
    };
  }, [lastOrderPrefill?.storeId]);

  // Initialize form
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: initialValues,
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
      form.setValue("pickupDate", firstDate, { shouldValidate: false });
      const range = getTimeRangeForDate(firstDate, schedule);
      form.setValue("pickupTime", getFirstAvailableTime(range), {
        shouldValidate: false,
      });
    } else {
      form.setValue("pickupTime", "", { shouldValidate: false });
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
      form.setValue("pickupTime", "", { shouldValidate: false });
      return;
    }

    const range = getTimeRangeForDate(pickupDate, storeSchedule);
    form.setValue("pickupTime", getFirstAvailableTime(range), {
      shouldValidate: false,
    });
  }, [pickupDate, storeSchedule, form]);

  // Form submission handler
  const onSubmit = async (value: CheckoutFormData) => {
    const isGuest = !user;

    // Validate user info is complete before proceeding
    if (!isUserInfoValid) {
      toast.error("Vyplňte prosím všetky osobné údaje");
      return;
    }

    const formattedDate = format(value.pickupDate, "yyyy-MM-dd");

    // Build guest info from customer store (user info already in DB for auth users)
    const guestInfo: GuestCustomerInfo | undefined = isGuest
      ? { name: userInfo.name, email: userInfo.email, phone: userInfo.phone }
      : undefined;

    const result = await createOrderFromCart({
      storeId: value.storeId,
      pickupDate: formattedDate,
      pickupTime: value.pickupTime,
      paymentMethod: value.paymentMethod,
      customerInfo: guestInfo,
    });

    if (result.success) {
      // Set last order ID for guests (for future prefill)
      if (isGuest) {
        setLastOrderIdAction(result.orderId).catch((error: unknown) => {
          console.error("Failed to set last order ID:", error);
        });
      }
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
