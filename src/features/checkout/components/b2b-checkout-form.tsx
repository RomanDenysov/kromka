"use client";

import {
  BuildingIcon,
  FileTextIcon,
  MapPinIcon,
  PencilIcon,
  StoreIcon,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
import { OrderPickupTimePicker } from "@/components/order-pickup-time-picker";
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
import { Spinner } from "@/components/ui/spinner";
import type { Address, PaymentMethod } from "@/db/types";
import type { DetailedCartItem } from "@/features/cart/api/queries";
import { useB2bCheckoutForm } from "@/features/checkout/hooks/use-b2b-checkout-form";
import { analytics } from "@/lib/analytics";
import { buildFullAddress } from "@/lib/geo-utils";
import { formatPrice } from "@/lib/utils";
import { B2bOrgEditSheet } from "./b2b-org-edit-sheet";

type OrgInfo = {
  id: string;
  name: string;
  billingName: string | null;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  billingEmail: string | null;
  billingAddress: Address | null;
};

type B2bCheckoutFormProps = {
  org: OrgInfo;
  items: DetailedCartItem[];
  ordersEnabled: boolean;
  contactPhone: string;
  contactEmail: string;
};

export function B2bCheckoutForm({
  org,
  items,
  ordersEnabled,
  contactPhone,
  contactEmail,
}: B2bCheckoutFormProps) {
  const { form, handleFormSubmit } = useB2bCheckoutForm({ orgId: org.id });

  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  // Track checkout started on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally fire once on mount
  useEffect(() => {
    analytics.checkoutStarted({
      item_count: items.length,
      total: totalCents,
      cart_type: "b2b",
    });
  }, []);

  const { isSubmitting, isValid: canSubmit } = form.formState;
  const isSubmitDisabled = isSubmitting || !canSubmit || !ordersEnabled;

  const addressString = org.billingAddress
    ? buildFullAddress(org.billingAddress)
    : null;

  const pickupDate = form.watch("pickupDate");

  return (
    <FormProvider {...form}>
      <form
        id="b2b-checkout-form"
        name="b2b-checkout-form"
        onSubmit={handleFormSubmit}
      >
        <FieldGroup className="rounded-sm px-1 md:border md:p-5">
          {/* Org Info Card (read-only) */}
          <FieldSet>
            <FieldLegend>
              <div className="flex items-center justify-between">
                <FieldTitle>
                  <BuildingIcon className="mr-2 inline size-5" />
                  Firemné údaje
                </FieldTitle>
                <B2bOrgEditSheet
                  initialName={org.billingName ?? org.name}
                  initialPhone={contactPhone}
                  orgId={org.id}
                  userEmail={contactEmail}
                >
                  <Button size="sm" type="button" variant="ghost">
                    <PencilIcon className="size-4" />
                    Upraviť
                  </Button>
                </B2bOrgEditSheet>
              </div>
            </FieldLegend>
            <div className="space-y-1 rounded-md border bg-muted/30 p-4 text-sm">
              <p className="font-medium">{org.billingName ?? org.name}</p>
              {org.ico && (
                <p className="text-muted-foreground">IČO: {org.ico}</p>
              )}
              {org.dic && (
                <p className="text-muted-foreground">DIČ: {org.dic}</p>
              )}
              {org.icDph && (
                <p className="text-muted-foreground">IČ DPH: {org.icDph}</p>
              )}
              {org.billingEmail && (
                <p className="text-muted-foreground">{org.billingEmail}</p>
              )}
            </div>
          </FieldSet>

          <FieldSeparator />

          {/* Delivery Address Card (read-only) */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>
                <MapPinIcon className="mr-2 inline size-5" />
                Adresa doručenia
              </FieldTitle>
            </FieldLegend>
            <div className="rounded-md border bg-muted/30 p-4 text-sm">
              {addressString ? (
                <p>{addressString}</p>
              ) : (
                <p className="text-muted-foreground">
                  Adresa doručenia nie je nastavená. Kontaktujte administrátora.
                </p>
              )}
            </div>
          </FieldSet>

          <FieldSeparator />

          {/* Delivery Date/Time */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Dátum a čas doručenia</FieldTitle>
              <FieldDescription>
                Vyberte dátum a čas, kedy chcete dostať objednávku.
              </FieldDescription>
            </FieldLegend>

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
                        restrictedDates={null}
                        selectedDate={field.value}
                        storeSchedule={null}
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
                        timeRange={null}
                      />
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Payment Method */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Platba</FieldTitle>
              <FieldDescription>
                Vyberte spôsob platby pre vašu objednávku.
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
                          className="grid grid-cols-2 gap-4"
                          onValueChange={(value) =>
                            field.onChange(value as PaymentMethod)
                          }
                          value={field.value}
                        >
                          <FieldLabel htmlFor="b2b_in_store">
                            <Field className="min-h-14 rounded-sm!">
                              <FieldContent className="items-center">
                                <StoreIcon className="size-7 shrink-0" />
                                <FieldTitle className="text-wrap text-center">
                                  Pri doručení
                                </FieldTitle>
                              </FieldContent>
                              <RadioGroupItem
                                className="peer sr-only"
                                id="b2b_in_store"
                                value="in_store"
                              />
                            </Field>
                          </FieldLabel>

                          <FieldLabel htmlFor="b2b_invoice">
                            <Field className="min-h-14 rounded-sm!">
                              <FieldContent className="items-center">
                                <FileTextIcon className="size-7 shrink-0" />
                                <FieldTitle className="text-wrap text-center">
                                  Na faktúru
                                </FieldTitle>
                              </FieldContent>
                              <RadioGroupItem
                                className="peer sr-only"
                                id="b2b_invoice"
                                value="invoice"
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
          <div className="flex items-center justify-between text-lg leading-none lg:text-xl">
            <span className="font-semibold">Spolu k úhrade</span>
            <span className="font-bold">{formatPrice(totalCents)}</span>
          </div>

          {!ordersEnabled && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
              Objednávky sú momentálne vypnuté.
            </div>
          )}

          <Button
            className="w-full text-base"
            disabled={isSubmitDisabled}
            size="xl"
            type="submit"
          >
            {isSubmitting && <Spinner />}
            Objednať
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
