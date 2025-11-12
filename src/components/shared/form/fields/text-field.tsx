import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  description?: string;
};

export function TextField({
  label,
  placeholder,
  className,
  description,
}: Props) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && (
        <FieldLabel className="text-muted-foreground" htmlFor={field.name}>
          {label}
        </FieldLabel>
      )}
      <Input
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
        volume="sm"
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
