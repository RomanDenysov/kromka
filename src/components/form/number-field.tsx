import { useFieldContext } from "@/components/form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function NumberField({
  label,
  placeholder,
  className,
  min,
  max,
  step,
}: Props) {
  const field = useFieldContext<number>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      field.handleChange(0);
      return;
    }
    const numValue = Number.parseFloat(value);
    if (!Number.isNaN(numValue)) {
      field.handleChange(numValue);
    }
  };

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Input
        id={field.name}
        max={max}
        min={min}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={handleChange}
        placeholder={placeholder}
        step={step}
        type="number"
        value={field.state.value ?? ""}
        volume="sm"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
