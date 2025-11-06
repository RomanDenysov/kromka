import { CheckIcon, EditIcon, XIcon } from "lucide-react";
import { useFieldContext } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@/components/ui/editable";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: (value: string) => void;
};

export function EditableField({
  label,
  placeholder,
  className,
  onSubmit,
}: Props) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleSubmit = (value: string) => {
    if (onSubmit) {
      onSubmit(value);
    } else {
      field.handleChange(value);
    }
  };

  return (
    <Field className="w-full" data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <Editable
        className="group flex flex-1 flex-row items-center gap-2"
        editing={isInvalid}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        value={field.state.value}
      >
        <EditableArea className="flex-1 md:text-2xl">
          <EditablePreview className={cn("w-full", className)} />
          <EditableInput className={cn(className)} />
        </EditableArea>

        <EditableTrigger asChild>
          <Button
            className="hidden group-hover:flex"
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <EditIcon className="text-muted-foreground" />
          </Button>
        </EditableTrigger>

        <EditableToolbar className="gap-1">
          <EditableSubmit asChild>
            <Button size="icon-xs" type="button" variant="outline">
              <CheckIcon />
            </Button>
          </EditableSubmit>
          <EditableCancel asChild>
            <Button size="icon-xs" type="button" variant="outline">
              <XIcon />
            </Button>
          </EditableCancel>
        </EditableToolbar>
      </Editable>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
