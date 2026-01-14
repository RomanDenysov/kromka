"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { FormProvider } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { DetailedCartItem } from "@/features/cart/queries";
import { useCheckoutForm } from "@/features/checkout/hooks/use-checkout-form";
import { usePickupRestrictions } from "@/features/checkout/hooks/use-pickup-restrictions";
import type { Store } from "@/features/stores/queries";
import type { User } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import type { LastOrderPrefill } from "../actions";
import { CheckoutAlerts } from "./checkout-alerts";
import { CheckoutMobileFooter } from "./checkout-mobile-footer";
import { CheckoutSummaryCard } from "./checkout-summary-card";
import { CustomerInfoCard } from "./customer-info-card";
import { PaymentMethodCard } from "./payment-method-card";
import { PickupDetailsCard } from "./pickup-details-card";

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
    <div className="sticky top-14 size-full">
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
                <CustomerInfoCard user={user ?? null} />
              </CardContent>
            </Card>

            {/* Pickup Details Card */}
            <PickupDetailsCard
              form={form}
              hasNoAvailableDates={hasNoAvailableDates}
              pickupDate={pickupDate}
              restrictedPickupDates={restrictedPickupDates}
              storeOptions={storeOptions}
              storeSchedule={storeSchedule}
              timeRange={timeRange}
            />

            {/* Payment Method Card */}
            <PaymentMethodCard form={form} />

            {/* Summary */}
            <CheckoutSummaryCard totalCents={totalCents} />

            {/* Alerts */}
            <CheckoutAlerts
              formErrors={formState.errors}
              ordersEnabled={ordersEnabled}
            />

            {/* Submit Button */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full text-base"
                disabled={isSubmitDisabled}
                size="xl"
                type="submit"
              >
                {isSubmitting && <Spinner />}
                Objednať
              </Button>
              <p className="text-center text-muted-foreground text-xs">
                Platba pri vyzdvihnutí na predajni
              </p>
            </div>

            {/* Continue Shopping Link */}
            <Link
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "w-full text-center text-muted-foreground"
              )}
              href="/e-shop"
            >
              <ArrowLeftIcon className="size-4" />
              Pokračovať v nákupe
            </Link>
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
