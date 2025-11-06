import { useStore } from "@tanstack/react-form";
import { useFormContext } from "@/components/form";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({ ...props }: ButtonProps) {
  const form = useFormContext();

  const [isSubmitting, canSubmit] = useStore(form.store, (state) => [
    state.isSubmitting,
    state.canSubmit,
  ]);

  const disabled = isSubmitting || !canSubmit;

  return <Button disabled={disabled} type="submit" {...props} />;
}
