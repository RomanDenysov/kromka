import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

type Props = {
  label?: string;
  description?: string;
};

export function SwitchField({ label, description }: Props) {
  const field = useFieldContext<boolean>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <>
      <div className="w-full max-w-md rounded-md border p-3">
        <Field data-invalid={isInvalid} orientation="horizontal">
          <FieldContent>
            {label && (
              <FieldLabel
                className="text-muted-foreground"
                htmlFor={field.name}
              >
                {label}
              </FieldLabel>
            )}
            {description && <FieldDescription>{description}</FieldDescription>}
          </FieldContent>
          <Switch
            checked={field.state.value}
            id={field.name}
            name={field.name}
            onBlur={field.handleBlur}
            onCheckedChange={(checked) => field.handleChange(!!checked)}
          />
        </Field>
      </div>
      {isInvalid && (
        <FieldError className="mt-1" errors={field.state.meta.errors} />
      )}
    </>
  );
}
