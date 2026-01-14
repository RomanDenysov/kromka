"use client";

import { usePathname } from "next/navigation";
import { Controller, FormProvider } from "react-hook-form";
import { ContinueShoppingLink } from "@/components/continue-shopping-link";
import { TextField } from "@/components/forms/fields/text-field";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
import { OrderStorePicker } from "@/components/order-store-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { DetailedCartItem } from "@/features/cart/queries";
import { useCheckoutForm } from "@/features/checkout/hooks/use-checkout-form";
import { usePickupRestrictions } from "@/features/checkout/hooks/use-pickup-restrictions";
import type { Store } from "@/features/stores/queries";
import type { User } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils";
import { useLoginModalOpen } from "@/store/login-modal-store";
import type { LastOrderPrefill } from "../actions";
import { CheckoutAlerts, PickupDateAlerts } from "./checkout-alerts";
import { CheckoutMobileFooter } from "./checkout-mobile-footer";
import { PaymentMethodCard } from "./payment-method-card";

type CheckoutFormProps = {
  user?: User;
  stores: Store[];
  items: DetailedCartItem[];
  ordersEnabled: boolean;
  lastOrderPrefill?: LastOrderPrefill | null;
};

export function CheckoutForm({
  user,
  stores,
  items,
  ordersEnabled,
  lastOrderPrefill,
}: CheckoutFormProps) {
  // Get pickup date restrictions from cart items
  const { restrictedPickupDates } = usePickupRestrictions(items);
  const openLogin = useLoginModalOpen();
  const pathname = usePathname();

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
    stores,
    lastOrderPrefill,
    restrictedPickupDates,
  });

  // Calculate total price
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  const { formState } = form;
  const isSubmitting = formState.isSubmitting;
  const canSubmit = formState.isValid;
  const isSubmitDisabled =
    isSubmitting || !canSubmit || !ordersEnabled || hasNoAvailableDates;

  return (
    <FormProvider {...form}>
      <form
        id="checkout-form"
        name="checkout-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-5">
          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Osobné údaje</CardTitle>
              <CardDescription>
                Zadajte svoje osobné údaje, aby sme Vás mohli kontaktovať.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TextField
                  className="lg:col-span-2"
                  inputClassName="w-full max-w-none"
                  label="Meno"
                  name="name"
                  placeholder="Janko Hraško"
                />
                <TextField
                  inputClassName="w-full max-w-none"
                  label="Email"
                  name="email"
                  placeholder="janko@priklad.sk"
                />
                <TextField
                  inputClassName="w-full max-w-none"
                  label="Telefón"
                  name="phone"
                  placeholder="+421 900 000 000"
                />
              </FieldGroup>
            </CardContent>
            {!user && (
              <CardFooter>
                <div className="flex grow items-start justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-medium text-xs">Máte účet?</p>
                    <p className="text-muted-foreground text-xs">
                      Prihláste sa pre uloženie objednávky do profilu.
                    </p>
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={() => openLogin("checkout", pathname)}
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    Prihlásiť sa
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>

          {/* Pickup Details Card */}
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

              <PickupDateAlerts
                hasNoAvailableDates={hasNoAvailableDates}
                restrictedPickupDates={restrictedPickupDates}
              />

              <FieldGroup className="grid w-full gap-4 lg:grid-cols-5">
                <Controller
                  control={form.control}
                  name="pickupDate"
                  render={({ field, fieldState }) => {
                    const isInvalid = fieldState.invalid;
                    return (
                      <Field
                        className="w-full lg:col-span-3"
                        data-invalid={isInvalid}
                      >
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
                      <Field
                        className="w-full lg:col-span-2"
                        data-invalid={isInvalid}
                      >
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
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <PaymentMethodCard form={form} />

          {/* Summary */}
          <div className="flex items-center justify-between pt-6 text-lg lg:text-xl">
            <span className="font-semibold">Spolu k úhrade</span>
            <span className="font-bold">{formatPrice(totalCents)}</span>
          </div>

          {/* Alerts */}
          <CheckoutAlerts
            formErrors={formState.errors}
            ordersEnabled={ordersEnabled}
          />

          {/* Submit Button */}
          <Button
            className="w-full text-base"
            disabled={isSubmitDisabled}
            size="xl"
            type="submit"
          >
            {isSubmitting && <Spinner />}
            Objednať
          </Button>

          {/* Continue Shopping Link */}
          <ContinueShoppingLink />
        </div>
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
