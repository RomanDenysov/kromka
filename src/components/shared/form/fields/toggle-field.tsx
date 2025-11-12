import { CheckIcon, XIcon } from "lucide-react";
import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  description?: string;
  className?: string;
};

export function ToggleField({ label, description, className }: Props) {
  const field = useFieldContext<boolean>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("gap-0.5", className)} data-invalid={isInvalid}>
      <div className="flex w-full flex-1 flex-row gap-1">
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        <Toggle
          className="group/toggle"
          id={field.name}
          name={field.name}
          onBlur={field.handleBlur}
          onPressedChange={(pressed) => field.handleChange(!!pressed)}
          pressed={field.state.value}
          size="sm"
        >
          <div className="items-center gap-0.5 group-data-[state=on]/toggle:flex group-data-[state=off]/toggle:hidden">
            <CheckIcon /> Ano
          </div>
          <div className="items-center gap-0.5 group-data-[state=off]/toggle:flex group-data-[state=on]/toggle:hidden">
            <XIcon />
            Nie
          </div>
        </Toggle>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
