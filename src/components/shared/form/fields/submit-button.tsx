"use client";

import { useFormContext } from "@/components/shared/form";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({ ...props }: ButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe>
      {(state) => (
        <Button
          disabled={state.isSubmitting || !state.canSubmit}
          type="submit"
          {...props}
        >
          {state.isSubmitting ? "Ukladám..." : "Uložiť"}
        </Button>
      )}
    </form.Subscribe>
  );
}
