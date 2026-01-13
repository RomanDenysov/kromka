import { CreditCardIcon, StoreIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
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
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PaymentMethod } from "@/db/types";
import type { CheckoutFormData } from "@/features/checkout/schema";

type PaymentMethodCardProps = {
  form: UseFormReturn<CheckoutFormData>;
};

/**
 * Card component for payment method selection.
 */
export function PaymentMethodCard({ form }: PaymentMethodCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platba</CardTitle>
        <CardDescription>
          Platba prebieha pri vyzdvihnutí objednávky na predajni.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    className="gap-4 md:grid-cols-2"
                    onValueChange={(value) =>
                      field.onChange(value as PaymentMethod)
                    }
                    value={field.value}
                  >
                    <FieldLabel htmlFor="in_store">
                      <Field className="gap-2 p-2.5!" orientation="horizontal">
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
                        className="cursor-not-allowed gap-2 p-2.5! opacity-50"
                        orientation="horizontal"
                      >
                        <CreditCardIcon className="size-5 shrink-0" />
                        <FieldTitle className="text-wrap">
                          Kartou online
                        </FieldTitle>
                        <span className="ml-auto text-muted-foreground text-xs">
                          Čoskoro
                        </span>
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
                {isInvalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
