"use client";

import { useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { submitSupportRequest } from "@/lib/actions/contact";
import { supportRequestSchema } from "@/validation/contact";

export function SupportForm() {
  const [isPending, startTransition] = useTransition();
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

  const form = useAppForm({
    validators: {
      onSubmit: supportRequestSchema,
    },
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
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await submitSupportRequest(value);

        if (result.success) {
          toast.success("Správa bola úspešne odoslaná");
          form.reset();
        } else {
          toast.error(result.error ?? "Nastala chyba pri odosielaní správy");
        }
      });
    },
  });

  // Update form when search params change
  useEffect(() => {
    if (path) {
      form.setFieldValue("sourcePath", path);
    }
    if (sourceUrl) {
      form.setFieldValue("sourceUrl", sourceUrl);
    }
    if (ref) {
      form.setFieldValue("sourceRef", ref);
    }
    // Update PostHog ID in case it changes
    if (typeof window !== "undefined") {
      const posthogId = posthog.get_distinct_id();
      if (posthogId) {
        form.setFieldValue("posthogId", posthogId);
      }
    }
  }, [ref, path, sourceUrl, form.setFieldValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pošlite nám správu</CardTitle>
        <CardDescription>
          Máte otázky alebo potrebujete pomoc? Napíšte nám a my sa vám ozveme.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <form.AppField name="name">
                  {(field) => (
                    <field.TextField label="Meno" placeholder="Vaše meno" />
                  )}
                </form.AppField>

                <form.AppField name="email">
                  {(field) => (
                    <field.TextField label="Email" placeholder="vas@email.sk" />
                  )}
                </form.AppField>

                <form.AppField name="rootCause">
                  {(field) => (
                    <field.TextField
                      label="Dôvod správy"
                      placeholder="Napríklad: Problém s objednávkou, otázka k produktu, nahlásenie chyby..."
                    />
                  )}
                </form.AppField>

                <form.AppField name="message">
                  {(field) => (
                    <field.TextareaField
                      label="Vysvetlenie"
                      placeholder="Napíšte krátke vysvetlenie..."
                      rows={6}
                    />
                  )}
                </form.AppField>
              </FieldGroup>

              <form.SubmitButton disabled={isPending}>
                {isPending ? "Odosiela sa..." : "Odoslať správu"}
              </form.SubmitButton>
            </FieldSet>
          </form>
        </form.AppForm>
      </CardContent>
    </Card>
  );
}
