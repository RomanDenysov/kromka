import { useFieldContext } from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Category = {
  id: string;
  name: string;
};

type Props = {
  label?: string;
  categories: Category[];
  className?: string;
};

export function CategorySelectField({ label, categories, className }: Props) {
  const field = useFieldContext<string[]>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const selectedIds = field.state.value ?? [];

  const handleToggle = (categoryId: string) => {
    const current = selectedIds;
    const newValue = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    field.handleChange(newValue);
  };

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex flex-col gap-3 rounded-md border p-4">
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No categories available
          </p>
        ) : (
          categories.map((category) => (
            <div className="flex items-center gap-2" key={category.id}>
              <Checkbox
                checked={selectedIds.includes(category.id)}
                id={`${field.name}-${category.id}`}
                onBlur={field.handleBlur}
                onCheckedChange={() => handleToggle(category.id)}
              />
              <label
                className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor={`${field.name}-${category.id}`}
              >
                {category.name}
              </label>
            </div>
          ))
        )}
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
