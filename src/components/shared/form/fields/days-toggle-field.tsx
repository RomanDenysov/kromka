import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  label?: string;
  description?: string;
  className?: string;
};

export function DaysToggleField({ label, description, className }: Props) {
  const field = useFieldContext<string[]>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}

      <ToggleGroup
        onValueChange={(value) => field.handleChange(value)}
        size="sm"
        type="multiple"
        value={field.state.value ?? []}
      >
        <ToggleGroupItem value="monday">po</ToggleGroupItem>
        <ToggleGroupItem value="tuesday">ut</ToggleGroupItem>
        <ToggleGroupItem value="wednesday">st</ToggleGroupItem>
        <ToggleGroupItem value="thursday">št</ToggleGroupItem>
        <ToggleGroupItem value="friday">pi</ToggleGroupItem>
        <ToggleGroupItem value="saturday">so</ToggleGroupItem>
        <ToggleGroupItem value="sunday">ne</ToggleGroupItem>
      </ToggleGroup>

      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
