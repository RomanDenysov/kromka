"use client";

import z from "zod";
import { useAppForm } from "@/components/shared/form";
import { FieldGroup, FieldSet } from "@/components/ui/field";

const BUSINESS_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Reštaurácia", value: "restaurant" },
  { label: "Hotel", value: "hotel" },
  { label: "Kaviareň", value: "cafe" },
  { label: "Obchod", value: "shop" },
  { label: "Iné", value: "other" },
];

const b2bRequestSchema = z.object({
  companyName: z.string().min(1, "Názov spoločnosti je povinný"),
  businessType: z
    .string()
    .min(1, "Typ podniku je povinný")
    .refine((val) => BUSINESS_TYPE_OPTIONS.some((opt) => opt.value === val), {
      message: "Vyberte platný typ podniku",
    }),
  userName: z.string().min(1, "Meno a priezvisko je povinné"),
  email: z.string().email("Neplatná emailová adresa"),
  phone: z.string().min(1, "Telefónne číslo je povinné"),
});

export function B2BForm() {
  const form = useAppForm({
    validators: {
      onSubmit: b2bRequestSchema,
    },
    defaultValues: {
      companyName: "",
      businessType: "",
      userName: "",
      email: "",
      phone: "",
    },
    onSubmit: ({ value }) => {
      // biome-ignore lint/suspicious/noConsole: Mock server operation
      console.log("B2B Request submitted:", value);
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet className="gap-5">
          <FieldGroup className="gap-4">
            <form.AppField name="companyName">
              {(field) => <field.TextField label="Názov spoločnosti" />}
            </form.AppField>

            <form.AppField name="businessType">
              {(field) => (
                <field.SelectField
                  label="Typ podniku"
                  options={BUSINESS_TYPE_OPTIONS}
                  placeholder="Vyberte typ podniku"
                />
              )}
            </form.AppField>

            <form.AppField name="userName">
              {(field) => <field.TextField label="Meno a priezvisko" />}
            </form.AppField>

            <form.AppField name="email">
              {(field) => (
                <field.TextField label="Email" placeholder="vas@email.sk" />
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.TextField
                  label="Telefónne číslo"
                  placeholder="+421 900 000 000"
                />
              )}
            </form.AppField>
          </FieldGroup>

          <form.SubmitButton>Odoslať žiadosť</form.SubmitButton>
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
