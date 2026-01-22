"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { submitSupportRequest } from "@/features/contact-form/api/actions";
import {
  type SupportRequestSchema,
  supportRequestSchema,
} from "@/features/contact-form/schema";

export function SupportForm() {
  const searchParams = useSearchParams();

  const ref = searchParams.get("ref");
  const path = searchParams.get("path");

  // Build source URL if we have pathname
  let sourceUrl: string | undefined;
  if (typeof window !== "undefined") {
    sourceUrl = path
      ? `${window.location.origin}${path}`
      : window.location.href;
  }

  const form = useForm<SupportRequestSchema>({
    resolver: zodResolver(supportRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      rootCause: "",
      message: "",
      ...(path && { sourcePath: path }),
      ...(sourceUrl && { sourceUrl }),
      ...(ref && { sourceRef: ref }),
      ...(typeof window !== "undefined" && {
        userAgent: window.navigator.userAgent,
      }),
      ...(typeof window !== "undefined" && {
        posthogId: posthog.get_distinct_id() ?? undefined,
      }),
    },
  });

  // Update form when search params change
  useEffect(() => {
    if (path) {
      form.setValue("sourcePath", path);
    }
    if (sourceUrl) {
      form.setValue("sourceUrl", sourceUrl);
    }
    if (ref) {
      form.setValue("sourceRef", ref);
    }
    // Update PostHog ID in case it changes
    if (typeof window !== "undefined") {
      const posthogId = posthog.get_distinct_id();
      if (posthogId) {
        form.setValue("posthogId", posthogId);
      }
    }
  }, [ref, path, sourceUrl, form]);

  const onSubmit = async (data: SupportRequestSchema) => {
    const result = await submitSupportRequest(data);

    if (result.success) {
      toast.success("Správa bola úspešne odoslaná");
      form.reset();
    } else {
      toast.error(result.error ?? "Nastala chyba pri odosielaní správy");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pošlite nám správu</CardTitle>
        <CardDescription>
          Máte otázky alebo potrebujete pomoc? Napíšte nám a my sa vám ozveme.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <TextField label="Meno" name="name" placeholder="Vaše meno" />

                <TextField
                  label="Email"
                  name="email"
                  placeholder="vas@email.sk"
                />

                <TextField
                  label="Dôvod správy"
                  name="rootCause"
                  placeholder="Napríklad: Problém s objednávkou, otázka k produktu, nahlásenie chyby..."
                />

                <TextareaField
                  label="Vysvetlenie"
                  name="message"
                  placeholder="Napíšte krátke vysvetlenie..."
                  rows={6}
                />
              </FieldGroup>

              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting
                  ? "Odosiela sa..."
                  : "Odoslať správu"}
              </Button>
            </FieldSet>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
