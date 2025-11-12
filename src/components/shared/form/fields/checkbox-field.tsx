import { useFieldContext } from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Props = {
  label?: string;
  description?: string;
  className?: string;
};

export function CheckboxField({ label, description, className }: Props) {
  const field = useFieldContext<boolean>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field
      className={className}
      data-invalid={isInvalid}
      orientation="horizontal"
    >
      <Checkbox
        checked={field.state.value ?? false}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(checked) => field.handleChange(!!checked)}
      />
      <div className="flex flex-col gap-1">
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </div>
    </Field>
  );
}
