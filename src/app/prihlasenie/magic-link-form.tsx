"use client";

import { SendIcon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { sendMagicLink } from "@/app/prihlasenie/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  const errors = state?.error ? [{ message: state.error }] : undefined;

  useEffect(() => {
    if (errors) {
      toast.error(errors[0].message);
    }
  }, [errors]);

  return (
    <form action={formAction} id="magic-link-form">
      {state?.success ? (
        <div>Email bol odoslaný</div>
      ) : (
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            placeholder="Zadajte svoj email"
          />
        </Field>
      )}
      <Button
        className="mt-4 w-full"
        disabled={pending}
        size="sm"
        type="submit"
      >
        {pending ? (
          <>
            <Spinner /> Odosielam...
          </>
        ) : (
          <>
            <SendIcon />
            Odoslať
          </>
        )}
      </Button>
    </form>
  );
}
