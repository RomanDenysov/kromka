"use client";

import { SendIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import z from "zod";
import { useAppForm } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth/client";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Zadajte platný email" })
    .min(1, "Email je povinný"),
});

export function MagicLinkForm() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("origin") || "/";
  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailSchema,
    },
    onSubmit: async ({ value }) =>
      await signIn.magicLink({ email: value.email, callbackURL }),
  });

  return (
    <form
      id="magic-link-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="email">
        {(field) => (
          <field.TextField label="Email" placeholder="Zadajte svoj email" />
        )}
      </form.AppField>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            className="mt-4 w-full"
            disabled={isSubmitting || !canSubmit}
            form="magic-link-form"
            size="sm"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Odosielam...
              </>
            ) : (
              <>
                <SendIcon />
                Odoslať
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
