import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  options: Option[];
  description?: string;
};

export function SelectField({
  label,
  placeholder,
  className,
  options,
  description,
}: Props) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field
      className={cn(className, "rounded-md border bg-card p-3")}
      data-invalid={isInvalid}
      orientation="horizontal"
    >
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Select
        onValueChange={(value) => field.handleChange(value)}
        value={field.state.value ?? ""}
      >
        <SelectTrigger
          className="capitalize"
          id={field.name}
          name={field.name}
          size="sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="end" position="popper">
          {options.map((option) => (
            <SelectItem
              className="capitalize"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
