/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
/** biome-ignore-all lint/suspicious/noConsole: allow debugging logs in checkout */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, startOfToday } from "date-fns";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  StoreIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/fields/text-field";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import {
  OrderStorePicker,
  type StoreOption,
} from "@/components/order-store-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentMethod } from "@/db/types";
import type { User } from "@/lib/auth/session";
import type { DetailedCartItem } from "@/features/cart/queries";
import { CheckoutTotalPrice } from "@/features/checkout/components/checkout-total-price";
import {
  type CheckoutFormData,
  checkoutFormSchema,
} from "@/features/checkout/schema";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getRestrictedPickupDates,
  getTimeRangeForDate,
  isBeforeDailyCutoff,
} from "@/features/checkout/utils";
import {
  createOrderFromCart,
  type GuestCustomerInfo,
} from "@/features/orders/actions";
import type { Store } from "@/features/stores/queries";
import { updateCurrentUserProfile } from "@/lib/actions/user-profile";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customer-store";
import { useLoginModalOpen } from "@/store/login-modal-store";

function buildGuestCustomerInfo(
  value: { name: string; email: string; phone: string },
  isGuest: boolean
): GuestCustomerInfo | null {
  if (!isGuest) {
    return null;
  }
  return { name: value.name, email: value.email, phone: value.phone };
}

function findStoreById(stores: Store[], id: string) {
  return stores.find((s) => s.id === id);
}

export function CheckoutForm({
  user,
  stores,
  items,
  ordersEnabled,
}: {
  user?: User;
  stores: Store[];
  items: DetailedCartItem[];
  ordersEnabled: boolean;
}) {
  const customer = useCustomerStore((state) => state.customer);
  const customerStore = useCustomerStore((state) => state.customerStore);
  const setCustomerStore = useCustomerStore(
    (state) => state.actions.setCustomerStore
  );
  const router = useRouter();
  const pathname = usePathname();
  const openLogin = useLoginModalOpen();

  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores?.map((store) => ({
        id: store.id,
        name: store.name,
        openingHours: store.openingHours,
      })) ?? [],
    [stores]
  );

  // Derive initial values from user (DB) or local customer store fallback
  const initialValues = useMemo(() => {
    const canOrderForTomorrow = isBeforeDailyCutoff();
    const defaultDate = canOrderForTomorrow
      ? addDays(startOfToday(), 1)
      : addDays(startOfToday(), 2);

    return {
      name: user?.name ?? customer?.name ?? "",
      email: user?.email ?? customer?.email ?? "",
      phone: user?.phone ?? customer?.phone ?? "",
      paymentMethod: "in_store" as PaymentMethod,
      pickupDate: defaultDate,
      pickupTime: "",
      storeId: user?.storeId ?? customerStore?.id ?? "",
    };
  }, [user, customer, customerStore]);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: initialValues,
  });

  const pickupDate = form.watch("pickupDate");
  const storeId = form.watch("storeId");

  // Derived from form value, not from hook
  const selectedStoreInForm =
    storeOptions.find((s) => s.id === storeId) ?? null;
  const storeSchedule = selectedStoreInForm?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

  // Compute restricted pickup dates from cart items' categories
  const restrictedPickupDates = useMemo(
    () => getRestrictedPickupDates(items),
    [items]
  );

  // Check if there are no available dates (empty intersection or no date found)
  const hasNoAvailableDates = useMemo(() => {
    if (!selectedStoreInForm) {
      return false;
    }
    const schedule = selectedStoreInForm.openingHours;
    const firstAvailableDate = getFirstAvailableDateWithRestrictions(
      schedule,
      restrictedPickupDates
    );
    // No available date found OR restricted dates exist but intersection is empty
    return (
      !firstAvailableDate ||
      (restrictedPickupDates !== null && restrictedPickupDates.size === 0)
    );
  }, [selectedStoreInForm, restrictedPickupDates]);

  // Handle storeId change - update pickupDate and pickupTime
  useEffect(() => {
    if (!storeId) {
      return;
    }

    const store = storeOptions.find((s) => s.id === storeId);
    const schedule = store?.openingHours ?? null;

    // Set first available date (considering cart restrictions)
    const firstDate = getFirstAvailableDateWithRestrictions(
      schedule,
      restrictedPickupDates
    );

    if (firstDate) {
      form.setValue("pickupDate", firstDate);
      const range = getTimeRangeForDate(firstDate, schedule);
      form.setValue("pickupTime", getFirstAvailableTime(range));
    } else {
      // No valid dates available - clear the time, keep date for UI feedback
      form.setValue("pickupTime", "");
    }
  }, [storeId, storeOptions, restrictedPickupDates, form]);

  // Handle pickupDate change - update pickupTime
  useEffect(() => {
    if (!pickupDate) {
      form.setValue("pickupTime", "");
      return;
    }

    // Set first available time for new date
    const range = getTimeRangeForDate(pickupDate, storeSchedule);
    const firstTime = getFirstAvailableTime(range);
    form.setValue("pickupTime", firstTime);
  }, [pickupDate, storeSchedule, form]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to memoize by all values
  useEffect(() => {
    const defaultStoreId = user?.storeId;
    if (!(defaultStoreId && storeOptions.length)) {
      return;
    }

    const store = storeOptions.find((s) => s.id === defaultStoreId);
    if (!store) {
      return;
    }

    const schedule = store.openingHours;
    const firstDate = getFirstAvailableDateWithRestrictions(
      schedule,
      restrictedPickupDates
    );

    if (firstDate) {
      form.setValue("pickupDate", firstDate);
      const range = getTimeRangeForDate(firstDate, schedule);
      form.setValue("pickupTime", getFirstAvailableTime(range));
    }
  }, [user?.storeId, storeOptions, restrictedPickupDates]);

  const onSubmit = async (value: CheckoutFormData) => {
    const isGuest = !user;

    // Save customer profile + storeId to DB (only for authenticated users)
    if (user) {
      await updateCurrentUserProfile({
        name: value.name,
        email: value.email,
        phone: value.phone,
        storeId: value.storeId,
      });
    }

    // Sync selected store to local state
    const selectedStore = findStoreById(stores, value.storeId);
    if (selectedStore && !user?.storeId) {
      setCustomerStore({ id: selectedStore.id, name: selectedStore.name });
    }
    const formattedDate = format(value.pickupDate, "yyyy-MM-dd");

    const guestInfo = buildGuestCustomerInfo(value, isGuest);
    const result = await createOrderFromCart({
      storeId: value.storeId,
      pickupDate: formattedDate,
      pickupTime: value.pickupTime,
      paymentMethod: value.paymentMethod,
      customerInfo: guestInfo ?? undefined,
    });

    if (result.success) {
      toast.success("Vaša objednávka bola vytvorená");
      router.push(`/pokladna/${result.orderId}` as Route);
    } else {
      toast.error(result.error ?? "Nepodarilo sa vytvoriť objednávku");
    }
  };

  const { formState } = form;
  const canSubmit = formState.isValid;
  const isSubmitting = formState.isSubmitting;

  return (
    <div className="sticky top-14 size-full">
      <FormProvider {...form}>
        <form
          id="checkout-form"
          name="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="flex flex-col gap-5">
            <Card>
              <CardHeader>
                <CardTitle>Osobné údaje</CardTitle>
                <CardDescription>
                  Zadajte svoje osobné údaje, aby sme vám mohli kontaktovať.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <TextField label="Meno" name="name" />
                  <TextField label="Email" name="email" />
                  <TextField label="Telefón" name="phone" />
                </FieldGroup>
                {!user && (
                  <div className="mt-4 flex items-start justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">Máte účet?</p>
                      <p className="text-muted-foreground text-xs">
                        Prihláste sa alebo si vytvorte účet pre uloženie
                        objednávky do vášho profilu (voliteľné).
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={() => openLogin("checkout", pathname)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Prihlásiť sa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Odberové miesto</CardTitle>
                <CardDescription>
                  Vyberte si miesto a čas, kedy chcete odobrať vašu objednávku.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <OrderStorePicker
                      onValueChange={(id) => field.onChange(id)}
                      storeOptions={storeOptions}
                      value={field.value}
                    />
                  )}
                />
                {hasNoAvailableDates && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="size-4" />
                    <AlertTitle>Žiadne dostupné dátumy</AlertTitle>
                    <AlertDescription className="text-xs">
                      Produkty v košíku majú rôzne dostupné dni vyzdvihnutia,
                      ktoré sa neprekrývajú. Nie je možné vybrať dátum, ktorý by
                      vyhovoval všetkým produktom. Prosím, odstráňte niektoré
                      produkty z košíka alebo kontaktujte nás.
                    </AlertDescription>
                  </Alert>
                )}
                {restrictedPickupDates &&
                  restrictedPickupDates.size > 0 &&
                  !hasNoAvailableDates && (
                    <Alert variant="default">
                      <AlertCircleIcon className="size-4" />
                      <AlertTitle>Obmedzené dátumy vyzdvihnutia</AlertTitle>
                      <AlertDescription className="text-xs">
                        Niektoré produkty v košíku sú dostupné len v určité dni.
                        Zobrazia sa vám len dostupné dátumy.
                      </AlertDescription>
                    </Alert>
                  )}
                <FieldGroup className="grid w-full gap-2 md:grid-cols-5">
                  <Controller
                    control={form.control}
                    name="pickupDate"
                    render={({ field, fieldState }) => {
                      const isInvalid =
                        fieldState.isTouched && fieldState.invalid;
                      return (
                        <Field
                          className="w-full md:col-span-3"
                          data-invalid={isInvalid}
                        >
                          <OrderPickupDatePicker
                            onDateSelect={(date) => field.onChange(date)}
                            restrictedDates={restrictedPickupDates}
                            selectedDate={field.value}
                            storeSchedule={storeSchedule}
                          />
                          {isInvalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <Controller
                    control={form.control}
                    name="pickupTime"
                    render={({ field, fieldState }) => {
                      const isInvalid =
                        fieldState.isTouched && fieldState.invalid;
                      return (
                        <Field
                          className="w-full md:col-span-2"
                          data-invalid={isInvalid}
                        >
                          <OrderPickupTimePicker
                            disabled={!pickupDate}
                            onTimeSelect={(time) => field.onChange(time)}
                            selectedTime={field.value}
                            timeRange={timeRange}
                          />
                          {isInvalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platba</CardTitle>
                <CardDescription>
                  Vyberte si spôsob platby, ktorým chcete zaplatiť vašu
                  objednávku.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="default">
                  <AlertCircleIcon className="size-5 shrink-0" />
                  <AlertTitle>
                    Platba online skutočne nie je dostupná
                  </AlertTitle>
                </Alert>
                <FieldGroup>
                  <Controller
                    control={form.control}
                    name="paymentMethod"
                    render={({ field, fieldState }) => {
                      const isInvalid =
                        fieldState.isTouched && fieldState.invalid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldContent>
                            <RadioGroup
                              aria-label="Spôsob platby"
                              className="md:grid-cols-2"
                              onValueChange={(value) =>
                                field.onChange(value as PaymentMethod)
                              }
                              value={field.value}
                            >
                              <FieldLabel htmlFor="in_store">
                                <Field
                                  className="gap-2 p-2.5!"
                                  orientation="horizontal"
                                >
                                  <StoreIcon className="size-5 shrink-0" />
                                  <FieldTitle className="text-wrap">
                                    Pri vyzdvihnutí
                                  </FieldTitle>

                                  <RadioGroupItem
                                    className="peer sr-only"
                                    id="in_store"
                                    value="in_store"
                                  />
                                </Field>
                              </FieldLabel>

                              <FieldLabel htmlFor="card">
                                <Field
                                  className="gap-2 p-2.5! text-muted-foreground"
                                  orientation="horizontal"
                                >
                                  <CreditCardIcon className="size-5 shrink-0" />
                                  <FieldTitle className="text-wrap">
                                    Kartou online
                                  </FieldTitle>
                                  <RadioGroupItem
                                    className="peer sr-only"
                                    disabled={true}
                                    id="card"
                                    value="card"
                                  />
                                </Field>
                              </FieldLabel>
                            </RadioGroup>
                          </FieldContent>
                          {isInvalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <CheckoutTotalPrice items={items} />
            {!ordersEnabled && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>
                  Aktuálne nie je možné objednať na stránke
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Prosím, kontaktujte nás cez email alebo telefón. Alebo na
                  predajni.
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full text-base"
              disabled={
                isSubmitting ||
                !canSubmit ||
                !ordersEnabled ||
                hasNoAvailableDates
              }
              size="xl"
              type="submit"
            >
              {isSubmitting && <Spinner />}
              Objednať
            </Button>
            {formState.errors && Object.keys(formState.errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>Chyba</AlertTitle>
                <AlertDescription className="text-xs">
                  {Object.values(formState.errors)
                    .slice(0, 1)
                    .map((error) => error?.message)
                    .filter(Boolean)
                    .join(", ")}
                  {Object.keys(formState.errors).length > 1 && (
                    <span className="text-xs">
                      {" "}
                      a {Object.keys(formState.errors).length - 1} ďalších
                      chybách
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <Link
              className={cn(
                buttonVariants({
                  variant: "link",
                  size: "sm",
                }),
                "w-full text-center"
              )}
              href="/e-shop"
            >
              <ArrowLeftIcon className="size-4" />
              Pokračovať v nákupe
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export function CheckoutFormSkeleton() {
  return (
    <div className="sticky top-14 size-full">
      <div className="grid grid-cols-1 gap-5">
        <Skeleton className="h-70 w-full" />
        <Skeleton className="h-50 w-full" />
        <Skeleton className="h-50 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
