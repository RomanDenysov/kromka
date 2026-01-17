"use client";

import { addDays, startOfToday } from "date-fns";
import { CreditCardIcon, FileTextIcon, StoreIcon } from "lucide-react";
import { useMemo } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { ContinueShoppingLink } from "@/components/continue-shopping-link";
import { PhoneField } from "@/components/forms/fields/phone-field";
import { TextField } from "@/components/forms/fields/text-field";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import { OrderStorePicker } from "@/components/order-store-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentMethod } from "@/db/types";
import type { DetailedCartItem } from "@/features/cart/queries";
import { useCheckoutForm } from "@/features/checkout/hooks/use-checkout-form";
import { usePickupRestrictions } from "@/features/checkout/hooks/use-pickup-restrictions";
import { isBeforeDailyCutoff } from "@/features/checkout/utils";
import type { Store } from "@/features/stores/queries";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { User } from "@/lib/auth/session";
import { sortStoresByDistance } from "@/lib/geo-utils";
import { formatPrice } from "@/lib/utils";
import type { LastOrderPrefill } from "../queries";
import { CheckoutAlerts, PickupDateAlerts } from "./checkout-alerts";
import { CheckoutCtaLogin } from "./checkout-cta-login";
import { CheckoutMobileFooter } from "./checkout-mobile-footer";

type CheckoutFormProps = {
  user?: User;
  stores: Store[];
  items: DetailedCartItem[];
  ordersEnabled: boolean;
  lastOrderPrefill?: LastOrderPrefill | null;
  isB2B?: boolean;
};

export function CheckoutForm({
  user,
  stores,
  items,
  ordersEnabled,
  lastOrderPrefill,
  isB2B = false,
}: CheckoutFormProps) {
  const { position } = useGeolocation();

  const storesWithDistance = useMemo(() => {
    if (!position) {
      return stores.map((store) => ({
        ...store,
        distance: null as number | null,
      }));
    }

    return sortStoresByDistance(stores, position.latitude, position.longitude);
  }, [stores, position]);

  // Get pickup date restrictions from cart items
  const { restrictedPickupDates } = usePickupRestrictions(items);

  // Initialize checkout form with all dependencies
  const {
    form,
    storeOptions,
    storeSchedule,
    timeRange,
    pickupDate,
    hasNoAvailableDates,
    onSubmit,
  } = useCheckoutForm({
    user,
    stores: storesWithDistance,
    lastOrderPrefill,
    restrictedPickupDates,
    isB2B,
  });

  // Calculate calendar start date for MiniCalendar
  const _calendarStartDate = useMemo(() => {
    const today = startOfToday();
    const canOrderForTomorrow = isBeforeDailyCutoff();
    return canOrderForTomorrow ? addDays(today, 1) : addDays(today, 2);
  }, []);

  // Calculate total price
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  const { isSubmitting, isValid: canSubmit, errors } = form.formState;
  const isSubmitDisabled =
    isSubmitting || !canSubmit || !ordersEnabled || hasNoAvailableDates;

  return (
    <FormProvider {...form}>
      <form
        id="checkout-form"
        name="checkout-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="rounded-sm px-1 md:border md:p-5">
          {/* Customer Info Card */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Osobné údaje</FieldTitle>
              <FieldDescription>
                Zadajte svoje osobné údaje, aby sme Vás mohli kontaktovať.
              </FieldDescription>
            </FieldLegend>
            <FieldGroup className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextField
                className="lg:col-span-2"
                inputClassName="w-full max-w-none"
                label="Meno"
                maxLength={150}
                name="name"
                placeholder="Janko Hraško"
              />
              <TextField
                inputClassName="w-full max-w-none"
                label="Email"
                maxLength={150}
                name="email"
                placeholder="janko@priklad.sk"
              />
              <PhoneField
                inputClassName="w-full max-w-none"
                label="Telefón"
                name="phone"
              />
            </FieldGroup>
            {!user && <CheckoutCtaLogin />}
          </FieldSet>
          <FieldSeparator />
          {/* Pickup Details Card */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Odberové miesto</FieldTitle>
              <FieldDescription>
                Vyberte si miesto a čas, kedy chcete odobrať vašu objednávku.
              </FieldDescription>
            </FieldLegend>

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

            <PickupDateAlerts
              hasNoAvailableDates={hasNoAvailableDates}
              restrictedPickupDates={restrictedPickupDates}
            />

            <FieldGroup className="grid w-full grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="pickupDate"
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.invalid;
                  return (
                    <Field className="w-full" data-invalid={isInvalid}>
                      <OrderPickupDatePicker
                        onDateSelect={field.onChange}
                        restrictedDates={restrictedPickupDates}
                        selectedDate={field.value}
                        storeSchedule={storeSchedule}
                      />
                    </Field>
                  );
                }}
              />
              <Controller
                control={form.control}
                name="pickupTime"
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.invalid;
                  return (
                    <Field className="w-full" data-invalid={isInvalid}>
                      <OrderPickupTimePicker
                        disabled={!pickupDate}
                        onTimeSelect={field.onChange}
                        selectedTime={field.value}
                        timeRange={timeRange}
                      />
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />
          {/* Payment Method Card */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Platba</FieldTitle>
              <FieldDescription>
                Platba prebieha pri vyzdvihnutí objednávky na predajni.
              </FieldDescription>
            </FieldLegend>
            <FieldGroup>
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.isTouched && fieldState.invalid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldContent>
                        <RadioGroup
                          aria-label="Spôsob platby"
                          className={`grid gap-4 ${isB2B ? "grid-cols-3" : "grid-cols-2"}`}
                          onValueChange={(value) =>
                            field.onChange(value as PaymentMethod)
                          }
                          value={field.value}
                        >
                          <FieldLabel htmlFor="in_store">
                            <Field className="min-h-14 rounded-sm!">
                              <FieldContent className="items-center">
                                <StoreIcon className="size-7 shrink-0" />
                                <FieldTitle className="text-wrap text-center">
                                  Pri vyzdvihnutí
                                </FieldTitle>
                              </FieldContent>
                              <RadioGroupItem
                                className="peer sr-only"
                                id="in_store"
                                value="in_store"
                              />
                            </Field>
                          </FieldLabel>

                          {isB2B && (
                            <FieldLabel htmlFor="invoice">
                              <Field className="min-h-14 rounded-sm!">
                                <FieldContent className="items-center">
                                  <FileTextIcon className="size-7 shrink-0" />
                                  <FieldTitle className="text-wrap text-center">
                                    Na faktúru
                                  </FieldTitle>
                                </FieldContent>
                                <RadioGroupItem
                                  className="peer sr-only"
                                  id="invoice"
                                  value="invoice"
                                />
                              </Field>
                            </FieldLabel>
                          )}

                          <FieldLabel htmlFor="card">
                            <Field className="min-h-14 cursor-not-allowed rounded-sm! opacity-50">
                              <FieldContent className="relative items-center">
                                <CreditCardIcon className="size-7 shrink-0" />
                                <FieldTitle className="text-wrap">
                                  Kartou online
                                </FieldTitle>
                                <Badge
                                  className="-top-2 -right-2 absolute"
                                  size="xs"
                                >
                                  Čoskoro
                                </Badge>
                              </FieldContent>
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
                  );
                }}
              />
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
        <div className="mt-5 flex flex-col gap-4 p-3">
          {/* Summary */}
          <div className="flex items-center justify-between text-lg leading-none lg:text-xl">
            <span className="font-semibold">Spolu k úhrade</span>
            <span className="font-bold">{formatPrice(totalCents)}</span>
          </div>
          {/* Alerts */}
          <CheckoutAlerts formErrors={errors} ordersEnabled={ordersEnabled} />

          {/* Submit Button - hidden on mobile where sticky footer is shown */}
          <Button
            className="hidden w-full text-base sm:inline-flex"
            disabled={isSubmitDisabled}
            id="checkout-submit-button-main"
            size="xl"
            type="submit"
          >
            {isSubmitting && <Spinner />}
            Objednať
          </Button>
        </div>
        <Separator className="my-4 block sm:hidden" />
        {/* Continue Shopping Link */}
        <ContinueShoppingLink />
      </form>

      {/* Mobile Sticky Footer */}
      <CheckoutMobileFooter
        canSubmit={canSubmit}
        hasNoAvailableDates={hasNoAvailableDates}
        isSubmitting={isSubmitting}
        ordersEnabled={ordersEnabled}
        totalCents={totalCents}
      />
    </FormProvider>
  );
}
