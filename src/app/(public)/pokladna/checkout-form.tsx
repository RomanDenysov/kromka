/** biome-ignore-all lint/style/noMagicNumbers: Date calculation constants */
"use client";

import { useStore } from "@tanstack/react-form";
import { CreditCardIcon, StoreIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import { useGetCart } from "@/hooks/use-get-cart";
import { useGetUser } from "@/hooks/use-get-user";
import { useSelectStore } from "@/hooks/use-select-store";
import {
  getFirstAvailableDate,
  getFirstAvailableTime,
  getTimeRangeForDate,
} from "@/lib/checkout-utils";
import { formatPrice } from "@/lib/utils";

const checkoutFormSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),

  paymentMethod: z.enum(["in_store", "card"]),
  pickupDate: z.date(),
  pickupTime: z.string().min(1),

  storeId: z.string().min(1),
});

export function CheckoutForm() {
  const { data: user } = useGetUser();
  const { stores } = useSelectStore();
  const { data: cart } = useGetCart();

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

  const userData = user?.isAnonymous
    ? null
    : {
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
      };

  const form = useAppForm({
    defaultValues: {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      paymentMethod: "in_store",
      pickupDate: undefined as Date | undefined,
      pickupTime: "",
      storeId: user?.storeMembers?.[0]?.storeId ?? "",
    },
    validators: {
      onSubmit: checkoutFormSchema,
    },
    onSubmit: ({ value }) => {
      // biome-ignore lint/suspicious/noConsole: debug logging for form submission
      console.log(value);
    },
  });

  const pickupDate = useStore(form.store, (state) => state.values.pickupDate);

  const storeId = useStore(form.store, (state) => state.values.storeId);

  // Derived from form value, not from hook
  const selectedStoreInForm =
    storeOptions.find((s) => s.id === storeId) ?? null;
  const storeSchedule = selectedStoreInForm?.openingHours ?? null;
  const timeRange = getTimeRangeForDate(pickupDate, storeSchedule);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to memoize by all values
  useEffect(() => {
    const defaultStoreId = user?.storeMembers?.[0]?.storeId;
    if (!(defaultStoreId && storeOptions.length)) {
      return;
    }

    const store = storeOptions.find((s) => s.id === defaultStoreId);
    if (!store) {
      return;
    }

    const schedule = store.openingHours;
    const firstDate = getFirstAvailableDate(schedule);

    if (firstDate) {
      form.setFieldValue("pickupDate", firstDate);
      const range = getTimeRangeForDate(firstDate, schedule);
      form.setFieldValue("pickupTime", getFirstAvailableTime(range));
    }
  }, [user?.storeMembers, storeOptions]);

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

                      // Set first available date
                      const firstDate = getFirstAvailableDate(schedule);
                      form.setFieldValue("pickupDate", firstDate ?? undefined);

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
