"use client";

import { CheckCircleIcon, SendIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import z from "zod";
import { useAppForm } from "@/components/shared/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/features/auth/client";
import { useLoginModal } from "@/store/login-modal-store";

const emailSchema = z.object({
  email: z
    .string()
    .email({ message: "Zadajte platný email" })
    .min(1, "Email je povinný"),
});

export function MagicLinkForm() {
  const { origin } = useLoginModal();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("origin") || origin || "/";
  const [isSuccess, setIsSuccess] = useState(false);
  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: emailSchema,
    },
    onSubmit: async ({ value }) =>
      await signIn.magicLink(
        { email: value.email, callbackURL },
        {
          onSuccess: () => setIsSuccess(true),
        }
      ),
  });

  return (
    <form
      id="magic-link-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {isSuccess ? (
        <Alert variant="default">
          <CheckCircleIcon />
          <AlertTitle>Email bol odoslaný</AlertTitle>
          <AlertDescription>
            Email bol odoslaný na váš email. Kliknite na odkaz v emaili pre
            prihlásenie.
          </AlertDescription>
        </Alert>
      ) : (
        <form.AppField name="email">
          {(field) => (
            <field.TextField label="Email" placeholder="Zadajte svoj email" />
          )}
        </form.AppField>
      )}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            className="mt-4 w-full"
            disabled={isSubmitting || !canSubmit || isSuccess}
            form="magic-link-form"
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
