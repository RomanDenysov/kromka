import { CategorySelector } from "@/components/category-selector";
import { useFieldContext } from "@/components/shared/form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Props = {
  label?: string;
  className?: string;
};

export function CategorySelectField({ label, className }: Props) {
  const field = useFieldContext<string[]>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const selectedIds = field.state.value ?? [];

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <CategorySelector
        onChange={(value) => field.handleChange(value)}
        value={selectedIds}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
