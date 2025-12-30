/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
/** biome-ignore-all lint/suspicious/noConsole: allow debugging logs in checkout */
"use client";

import { useStore } from "@tanstack/react-form";
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
import { useEffect, useMemo, useTransition } from "react";
import { toast } from "sonner";
import z from "zod";
import { CheckoutTotalPrice } from "@/components/checkout/checkout-total-price";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import {
  OrderStorePicker,
  type StoreOption,
} from "@/components/order-store-picker";
import { useAppForm } from "@/components/shared/form";
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
import { PAYMENT_METHODS, type PaymentMethod } from "@/db/types";
import {
  createOrderFromCart,
  type GuestCustomerInfo,
} from "@/lib/actions/orders";
import { updateCurrentUserProfile } from "@/lib/actions/user-profile";
import type { User } from "@/lib/auth/session";
import type { DetailedCartItem } from "@/lib/cart/queries";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getRestrictedPickupDates,
  getTimeRangeForDate,
  isBeforeDailyCutoff,
} from "@/lib/checkout-utils";
import type { Store } from "@/lib/queries/stores";
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

const checkoutFormSchema = z.object({
  name: z.string().min(1, "Meno je povinné"),
  email: z.email("Neplatná emailová adresa"),
  phone: z.string().min(1, "Telefónne číslo je povinné"),

  paymentMethod: z.enum(PAYMENT_METHODS, "Spôsob platby je povinný"),
  pickupDate: z.date().min(new Date(), "Dátum vyzdvihnutia je povinný"),
  pickupTime: z.string().min(1, "Čas vyzdvihnutia je povinný"),

  storeId: z.string().min(1, "Miesto vyzdvihnutia je povinné"),
});

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

  const [isPending, startTransition] = useTransition();

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

  const form = useAppForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: checkoutFormSchema,
    },
    onSubmit: ({ value }) =>
      startTransition(async () => {
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
      }),
  });

  const pickupDate = useStore(form.store, (state) => state.values.pickupDate);

  const storeId = useStore(form.store, (state) => state.values.storeId);

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
      form.setFieldValue("pickupDate", firstDate);
      const range = getTimeRangeForDate(firstDate, schedule);
      form.setFieldValue("pickupTime", getFirstAvailableTime(range));
    }
  }, [user?.storeId, storeOptions, restrictedPickupDates]);

  return (
    <div className="sticky top-14 size-full">
      <form.AppForm>
        <form
          id="checkout-form"
          name="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
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
                  <form.AppField name="name">
                    {(field) => <field.TextField label="Meno" />}
                  </form.AppField>
                  <form.AppField name="email">
                    {(field) => <field.TextField label="Email" />}
                  </form.AppField>
                  <form.AppField name="phone">
                    {(field) => <field.TextField label="Telefón" />}
                  </form.AppField>
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
                <form.Field
                  listeners={{
                    onChange: ({ value }) => {
                      if (!value) {
                        return;
                      }

                      const store = storeOptions.find((s) => s.id === value);
                      const schedule = store?.openingHours ?? null;

                      // Set first available date (considering cart restrictions)
                      const firstDate = getFirstAvailableDateWithRestrictions(
                        schedule,
                        restrictedPickupDates
                      );
                      form.setFieldValue("pickupDate", firstDate ?? new Date());

                      // Set first available time
                      if (firstDate) {
                        const range = getTimeRangeForDate(firstDate, schedule);
                        const firstTime = getFirstAvailableTime(range);
                        form.setFieldValue("pickupTime", firstTime);
                      } else {
                        form.setFieldValue("pickupTime", "");
                      }
                    },
                  }}
                  name="storeId"
                >
                  {(field) => (
                    <OrderStorePicker
                      onValueChange={(id) => field.handleChange(id)}
                      storeOptions={storeOptions}
                      value={field.state.value}
                    />
                  )}
                </form.Field>
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
                  <form.Field
                    listeners={{
                      onChange: ({ value }) => {
                        if (!value) {
                          form.setFieldValue("pickupTime", "");
                          return;
                        }

                        // Set first available time for new date
                        const range = getTimeRangeForDate(value, storeSchedule);
                        const firstTime = getFirstAvailableTime(range);
                        form.setFieldValue("pickupTime", firstTime);
                      },
                    }}
                    name="pickupDate"
                  >
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          className="w-full md:col-span-3"
                          data-invalid={isInvalid}
                        >
                          <OrderPickupDatePicker
                            onDateSelect={(date) => field.handleChange(date)}
                            restrictedDates={restrictedPickupDates}
                            selectedDate={field.state.value}
                            storeSchedule={storeSchedule}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="pickupTime">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          className="w-full md:col-span-2"
                          data-invalid={isInvalid}
                        >
                          <OrderPickupTimePicker
                            disabled={!pickupDate}
                            onTimeSelect={(time) => field.handleChange(time)}
                            selectedTime={field.state.value}
                            timeRange={timeRange}
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
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
                  <form.Field name="paymentMethod">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldContent>
                            <RadioGroup
                              aria-label="Spôsob platby"
                              className="md:grid-cols-2"
                              onValueChange={(value) =>
                                field.handleChange(value as PaymentMethod)
                              }
                              value={field.state.value}
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
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
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

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full text-base"
                  disabled={
                    isSubmitting || !canSubmit || isPending || !ordersEnabled
                  }
                  size="xl"
                  type="submit"
                >
                  {isPending && <Spinner />}
                  Objednať
                </Button>
              )}
            </form.Subscribe>
            {form.state.errors && form.state.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>Chyba</AlertTitle>
                <AlertDescription className="text-xs">
                  {form.state.errors
                    .slice(0, 1)
                    .map((error) => error?.message)
                    .join(", ")}
                  {form.state.errors.length > 1 && (
                    <span className="text-xs">
                      a {form.state.errors.length - 1} ďalších chybách
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
      </form.AppForm>
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
