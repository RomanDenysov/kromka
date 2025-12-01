"use client";

import { useQuery } from "@tanstack/react-query";
import { format, getDay } from "date-fns";
import { CreditCardIcon, StoreIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import z from "zod";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import {
  OrderStorePicker,
  type StoreOption,
} from "@/components/order-store-picker";
import { useAppForm } from "@/components/shared/form";
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
import type { StoreSchedule, TimeRange } from "@/db/types";
import { useGetCart } from "@/hooks/use-get-cart";
import { useGetUser } from "@/hooks/use-get-user";
import { formatPrice } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const checkoutFormSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),

  paymentMethod: z.enum(["in_store", "card"]),
  pickupDate: z.date(),
  pickupTime: z.string().min(1),

  storeId: z.string().min(1),
});

/**
 * Gets the time range for a specific date from the store schedule.
 * Returns null if the store is closed on that date.
 */
function getTimeRangeForDate(
  date: Date | undefined,
  schedule: StoreSchedule | null
): TimeRange | null {
  if (!date) {
    return null;
  }

  if (!schedule) {
    return null;
  }

  const dateKey = format(date, "yyyy-MM-dd");

  // Check exceptions first
  const exception = schedule.exceptions?.[dateKey];
  if (exception === "closed" || exception === null) {
    return null;
  }
  if (exception) {
    return exception;
  }

  // Check regular hours
  const dayOfWeek = getDay(date);
  const dayKey = DAY_KEYS[dayOfWeek];
  const daySchedule = schedule.regularHours[dayKey];

  if (daySchedule === "closed" || daySchedule === null) {
    return null;
  }
  return daySchedule;
}

export function CheckoutForm() {
  const { data: user } = useGetUser();
  const trpc = useTRPC();

  const { data: stores } = useQuery(trpc.public.stores.list.queryOptions());
  const { data: cart } = useGetCart();

  const [selectedStore, setSelectedStore] = useState<StoreOption | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  // Map stores to StoreOption format
  const storeOptions: StoreOption[] = useMemo(
    () =>
      stores?.map((store) => ({
        id: store.id,
        name: store.name,
        openingHours: store.openingHours,
      })) ?? [],
    [stores]
  );

  // Get user's default store ID from membership
  const userDefaultStoreId = user?.isAnonymous
    ? null
    : (user?.storeMembers?.[0]?.storeId ?? null);

  const userData = user?.isAnonymous
    ? null
    : {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? null,
      };

  const form = useAppForm({
    defaultValues: {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      paymentMethod: "in_store",
      pickupDate: undefined as Date | undefined,
      pickupTime: "",
      storeId: "",
    },
    validators: {
      onSubmit: checkoutFormSchema,
    },
    onSubmit: ({ value }) => {
      // biome-ignore lint/suspicious/noConsole: debug logging for form submission
      console.log(value);
    },
  });

  // Initialize store selection from user's membership once data is loaded
  useEffect(() => {
    if (isInitialized || !storeOptions.length) {
      return;
    }

    if (userDefaultStoreId) {
      const defaultStore = storeOptions.find(
        (s) => s.id === userDefaultStoreId
      );
      if (defaultStore) {
        setSelectedStore(defaultStore);
        form.setFieldValue("storeId", defaultStore.id);
        setIsInitialized(true);
      }
    }
  }, [userDefaultStoreId, storeOptions, isInitialized, form]);

  const storeSchedule = selectedStore?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

  const handleStoreChange = (storeId: string, store: StoreOption | null) => {
    setSelectedStore(store);
    form.setFieldValue("storeId", storeId);
    // Reset date and time when store changes
    setPickupDate(undefined);
    form.setFieldValue("pickupDate", undefined);
    form.setFieldValue("pickupTime", "");
  };

  const handleDateChange = (date: Date) => {
    setPickupDate(date);
    form.setFieldValue("pickupDate", date);
    // Reset time when date changes (new day may have different hours)
    form.setFieldValue("pickupTime", "");
  };

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
                <form.Field name="storeId">
                  {(field) => (
                    <OrderStorePicker
                      onValueChange={handleStoreChange}
                      storeOptions={storeOptions}
                      value={field.state.value}
                    />
                  )}
                </form.Field>
                <FieldGroup className="grid w-full gap-2 md:grid-cols-5">
                  <form.Field name="pickupDate">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          className="w-full md:col-span-3"
                          data-invalid={isInvalid}
                        >
                          <OrderPickupDatePicker
                            onDateSelect={handleDateChange}
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
              <CardContent>
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
                            onValueChange={(value) => field.handleChange(value)}
                            value={field.state.value}
                          >
                            <FieldLabel htmlFor="in_store">
                              <Field orientation="horizontal">
                                <StoreIcon />
                                <FieldTitle>Na odberovom mieste</FieldTitle>

                                <RadioGroupItem
                                  className="peer sr-only"
                                  id="in_store"
                                  value="in_store"
                                />
                              </Field>
                            </FieldLabel>

                            <FieldLabel htmlFor="card">
                              <Field orientation="horizontal">
                                <CreditCardIcon />
                                <FieldTitle>Kartou online</FieldTitle>
                                <RadioGroupItem
                                  className="peer sr-only"
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
                {formatPrice(cart?.totalCents ?? 0)}
              </span>
            </div>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full text-base"
                  disabled={isSubmitting || !canSubmit}
                  size="xl"
                  type="submit"
                >
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
