import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
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
    <Field
      className={className}
      data-invalid={isInvalid}
      orientation="responsive"
    >
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Input
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
        volume="sm"
      />
    </Field>
  );
}
