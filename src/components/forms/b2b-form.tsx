"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/forms/fields/select-field";
import { TextField } from "@/components/forms/fields/text-field";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { submitB2BRequest } from "@/features/b2b-request/api/actions";
import {
  type B2BRequestSchema,
  b2bRequestSchema,
} from "@/features/b2b-request/schema";

const BUSINESS_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Reštaurácia", value: "restaurant" },
  { label: "Hotel", value: "hotel" },
  { label: "Kaviareň", value: "cafe" },
  { label: "Obchod", value: "shop" },
  { label: "Iné", value: "other" },
];

export function B2BForm() {
  const form = useForm<B2BRequestSchema>({
    resolver: zodResolver(b2bRequestSchema),
    defaultValues: {
      companyName: "",
      businessType: "",
      userName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: B2BRequestSchema) => {
    const result = await submitB2BRequest(data);

    if (result.success) {
      toast.success("Žiadosť bola úspešne odoslaná");
      form.reset();
    } else {
      toast.error(result.error ?? "Nastala chyba pri odosielaní žiadosti");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <FieldSet className="gap-5">
          <FieldGroup className="gap-4">
            <TextField label="Názov spoločnosti" name="companyName" />

            <SelectField
              label="Typ podniku"
              name="businessType"
              options={BUSINESS_TYPE_OPTIONS}
              placeholder="Vyberte typ podniku"
            />

            <TextField label="Meno a priezvisko" name="userName" />

            <TextField label="Email" name="email" placeholder="vas@email.sk" />

            <TextField
              label="Telefónne číslo"
              name="phone"
              placeholder="+421 900 000 000"
            />
          </FieldGroup>

          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Odosiela sa..." : "Odoslať žiadosť"}
          </Button>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
