"use client";

import { useForm } from "@tanstack/react-form";
import { SendIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth/client";

const schema = z.object({
  email: z.string().email().min(1, "Email je povinný"),
});

export function MagicLinkForm() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("origin") || "/";
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      await signIn.magicLink(
        {
          email: value.email,
          callbackURL,
        },
        {
          onSuccess: () => {
            toast.success("Email s odkazom na prihlásenie bol odoslaný");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    },
  });

  return (
    <form
      id="magic-link-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                aria-invalid={isInvalid}
                autoComplete="email"
                className="h-[30px]"
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Zadajte svoj email"
                value={field.state.value}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      </form.Field>
      <Button
        className="mt-4 w-full"
        disabled={form.state.isSubmitting}
        form="magic-link-form"
        size="xs"
        type="submit"
      >
        {form.state.isSubmitting ? (
          <>
            <Spinner /> <span>Odosielanie...</span>
          </>
        ) : (
          <>
            <SendIcon /> <span>Odoslať</span>
          </>
        )}
      </Button>
    </form>
  );
}
