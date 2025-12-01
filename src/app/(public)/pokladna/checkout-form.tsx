"use client";

import { CreditCardIcon, StoreIcon } from "lucide-react";
import z from "zod";
import { OrderPickupDatePicker } from "@/components/order-pickup-date-picker";
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
import { useGetUser } from "@/hooks/use-get-user";

const checkoutFormSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),

  paymentMethod: z.enum(["in_store", "card"]),
  pickupDate: z.date(),
  pickupTime: z.string().min(1),
});

export function CheckoutForm() {
  const { data: user } = useGetUser();

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
      pickupDate: new Date(),
      pickupTime: "08:00",
    },
    validators: {
      onSubmit: checkoutFormSchema,
    },
    onSubmit: ({ value }) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log(value);
    },
  });

  return (
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
            <CardContent>
              <FieldGroup>
                <form.Field name="pickupDate">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} orientation="horizontal">
                        <OrderPickupDatePicker />
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
                        field.state.meta.isTouched && !field.state.meta.isValid
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
  );
}
