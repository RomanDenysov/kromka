"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PhoneField } from "@/components/forms/fields/phone-field";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { submitB2bApplication } from "@/features/b2b/applications/api/actions";
import {
  type B2bApplicationSchema,
  b2bApplicationSchema,
} from "@/validation/b2b";

const AddressAutocompleteField = dynamic(
  () =>
    import("@/components/forms/fields/address-autocomplete-field").then(
      (m) => m.AddressAutocompleteField
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-9 w-full" />,
  }
);

export function B2BApplicationForm() {
  const router = useRouter();
  const form = useForm<B2bApplicationSchema>({
    resolver: zodResolver(b2bApplicationSchema),
    defaultValues: {
      companyName: "",
      ico: "",
      dic: "",
      icDph: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      billingAddress: undefined,
      message: "",
    },
  });

  const onSubmit: SubmitHandler<B2bApplicationSchema> = async (data) => {
    const result = await submitB2bApplication(data);

    if (result.success) {
      toast.success("Žiadosť bola úspešne odoslaná");
      // biome-ignore lint/suspicious/noExplicitAny: Next.js router.push type compatibility
      router.push("/b2b/apply/success" as any);
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
        <FieldSet className="gap-6 rounded-lg border p-6">
          {/* Company Information */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Informácie o spoločnosti</FieldTitle>
            </FieldLegend>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                className="md:col-span-2"
                label="Názov spoločnosti"
                name="companyName"
              />
              <TextField label="IČO" name="ico" placeholder="12345678" />
              <TextField label="DIČ" name="dic" placeholder="SK1234567890" />
              <TextField
                label="IČ DPH"
                name="icDph"
                placeholder="SK1234567890"
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Contact Person */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Kontaktná osoba</FieldTitle>
            </FieldLegend>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField label="Meno a priezvisko" name="contactName" />
              <TextField
                label="Email"
                name="contactEmail"
                placeholder="kontakt@spolocnost.sk"
              />
              <PhoneField
                className="md:col-span-2"
                label="Telefónne číslo"
                name="contactPhone"
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Billing Address */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Fakturačná adresa</FieldTitle>
            </FieldLegend>
            <FieldGroup>
              <AddressAutocompleteField
                baseFieldName="billingAddress"
                label="Adresa"
                name="billingAddress"
              />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* Message */}
          <FieldSet>
            <FieldLegend>
              <FieldTitle>Dodatočné informácie</FieldTitle>
            </FieldLegend>
            <FieldGroup>
              <TextareaField
                label="Správa (voliteľné)"
                name="message"
                placeholder="Máte nejaké špeciálne požiadavky alebo otázky?"
                rows={5}
              />
            </FieldGroup>
          </FieldSet>

          <Button
            className="w-full md:w-auto"
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >
            {form.formState.isSubmitting ? "Odosiela sa..." : "Odoslať žiadosť"}
          </Button>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
