import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { MaskInput } from "@/components/ui/mask-input";
import { formatCentsToPrice } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  description?: string;
  placeholder?: string;
};

export function PriceInputField({
  label,
  className,
  description,
  placeholder,
}: Props) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const initialValue =
    field.state.value !== undefined
      ? formatCentsToPrice(field.state.value).toString()
      : "";

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
      <MaskInput
        className="h-8 px-2 py-0.5 text-sm"
        currency="EUR"
        defaultValue={initialValue}
        id={field.name}
        locale="sk-SK"
        mask="currency"
        name={field.name}
        onBlur={field.handleBlur}
        onValueChange={(_maskedValue, unmaskedValue) => {
          const price = Number.parseFloat(unmaskedValue);
          if (Number.isNaN(price)) {
            field.handleChange(0);
            return;
          }
          const cents = Math.round(price * 100);
          field.handleChange(cents);
        }}
        placeholder={placeholder}
      />
    </Field>
  );
}
