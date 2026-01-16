"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, SendIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { TextField } from "@/components/forms/fields/text-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth/client";
import { useLoginModal } from "@/store/login-modal-store";

const emailSchema = z.object({
  email: z
    .email({ message: "Zadajte platný email" })
    .min(1, "Email je povinný"),
});

type EmailSchema = z.infer<typeof emailSchema>;

export function MagicLinkForm() {
  const { origin } = useLoginModal();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("origin") || origin || "/";
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: EmailSchema) => {
    await signIn.magicLink(
      { email: data.email, callbackURL },
      {
        onSuccess: () => setIsSuccess(true),
      }
    );
  };

  const { formState } = form;
  const isSubmitting = formState.isSubmitting;
  const canSubmit = formState.isValid;

  return (
    <FormProvider {...form}>
      <form id="magic-link-form" onSubmit={form.handleSubmit(onSubmit)}>
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
          <TextField
            inputClassName="max-w-none"
            label="Email"
            name="email"
            placeholder="Zadajte svoj email"
          />
        )}
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
      </form>
    </FormProvider>
  );
}
