"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { submitB2BRequest } from "@/lib/actions/b2b";
import { b2bRequestSchema } from "@/validation/contact";

const BUSINESS_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Reštaurácia", value: "restaurant" },
  { label: "Hotel", value: "hotel" },
  { label: "Kaviareň", value: "cafe" },
  { label: "Obchod", value: "shop" },
  { label: "Iné", value: "other" },
];

export function B2BForm() {
  const [isPending, startTransition] = useTransition();

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
      startTransition(async () => {
        const result = await submitB2BRequest(value);

        if (result.success) {
          toast.success("Žiadosť bola úspešne odoslaná");
          form.reset();
        } else {
          toast.error(result.error ?? "Nastala chyba pri odosielaní žiadosti");
        }
      });
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

          <form.SubmitButton disabled={isPending}>
            {isPending ? "Odosiela sa..." : "Odoslať žiadosť"}
          </form.SubmitButton>
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
