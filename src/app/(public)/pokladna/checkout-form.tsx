/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
"use client";

import { useStore } from "@tanstack/react-form";
import { AlertCircleIcon, CreditCardIcon, StoreIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { toast } from "sonner";
import z from "zod";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import {
  OrderStorePicker,
  type StoreOption,
} from "@/components/order-store-picker";
import { useAppForm } from "@/components/shared/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { PAYMENT_METHODS, type PaymentMethod } from "@/db/types";
import { createOrderFromCart } from "@/lib/actions/orders";
import { updateCurrentUserProfile } from "@/lib/actions/user-profile";
import type { User } from "@/lib/auth/session";
import {
  getFirstAvailableDateWithRestrictions,
  getFirstAvailableTime,
  getRestrictedPickupDates,
  getTimeRangeForDate,
} from "@/lib/checkout-utils";
import type { Store } from "@/lib/queries/stores";
import { formatPrice } from "@/lib/utils";
import { useCustomerStore } from "@/store/customer-store";
import type { Cart } from "@/types/cart";

const checkoutFormSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),

  paymentMethod: z.enum(PAYMENT_METHODS),
  pickupDate: z.date(),
  pickupTime: z.string().min(1),

  storeId: z.string().min(1),
});

export function CheckoutForm({
  user,
  stores,
  cart,
}: {
  user?: User;
  stores: Store[];
  cart: Cart | null;
}) {
  const items = cart?.items ?? [];
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  const customer = useCustomerStore((state) => state.customer);
  const customerStore = useCustomerStore((state) => state.customerStore);
  const setCustomerStore = useCustomerStore(
    (state) => state.actions.setCustomerStore
  );
  const router = useRouter();

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
    const userData = user?.isAnonymous ? null : user;

    return {
      name: userData?.name ?? customer?.name ?? "",
      email: userData?.email ?? customer?.email ?? "",
      phone: userData?.phone ?? "",
      paymentMethod: "in_store" as PaymentMethod,
      pickupDate: new Date(),
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
        // Save customer profile + storeId to DB
        await updateCurrentUserProfile({
          name: value.name,
          email: value.email,
          phone: value.phone,
          storeId: value.storeId,
        });

        // Sync selected store to local state if user didn't have one
        if (!user?.storeId && value.storeId) {
          const selectedStore = stores.find((s) => s.id === value.storeId);
          if (selectedStore) {
            setCustomerStore({
              id: selectedStore.id,
              name: selectedStore.name,
            });
          }
        }

        const result = await createOrderFromCart({
          storeId: value.storeId,
          pickupDate: value.pickupDate,
          pickupTime: value.pickupTime,
          paymentMethod: value.paymentMethod,
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
                {restrictedPickupDates && restrictedPickupDates.size > 0 && (
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
                    {(field) => (
                      <Field
                        data-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      >
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
                                className="gap-2 p-2.5!"
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
                      </Field>
                    )}
                  </form.Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className="flex flex-row items-center justify-between">
              <span className="font-medium text-lg">Spolu</span>
              <span className="font-semibold text-lg">
                {formatPrice(totalCents)}
              </span>
            </div>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full text-base"
                  disabled={isSubmitting || !canSubmit || isPending}
                  size="xl"
                  type="submit"
                >
                  {isPending && <Spinner />}
                  Objednať
                </Button>
              )}
            </form.Subscribe>
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
