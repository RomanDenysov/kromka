"use client";

import { useState } from "react";
import { useFieldContext } from "@/components/form";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/kibo-ui/tags";
import { Field, FieldError, FieldLabel } from "../ui/field";

type Category = {
  id: string;
  name: string;
};

type Props = {
  label?: string;
  categories: Category[];
  className?: string;
  placeholder?: string;
};

export function CategoryTagsField({
  label,
  categories,
  className,
  placeholder = "Select categories...",
}: Props) {
  const field = useFieldContext<string[]>();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const selectedIds = field.state.value ?? [];

  const selectedCategories = categories.filter((cat) =>
    selectedIds.includes(cat.id)
  );

  const availableCategories = categories.filter(
    (cat) =>
      !selectedIds.includes(cat.id) &&
      cat.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (categoryId: string) => {
    const newValue = [...selectedIds, categoryId];
    field.handleChange(newValue);
    setSearchValue("");
  };

  const handleRemove = (categoryId: string) => {
    const newValue = selectedIds.filter((id) => id !== categoryId);
    field.handleChange(newValue);
  };

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Tags onOpenChange={setOpen} open={open}>
        <TagsTrigger
          onBlur={field.handleBlur}
          onClick={() => setOpen(true)}
          type="button"
        >
          {selectedCategories.length > 0 ? (
            selectedCategories.map((category) => (
              <TagsValue
                key={category.id}
                onRemove={() => handleRemove(category.id)}
                variant="secondary"
              >
                {category.name}
              </TagsValue>
            ))
          ) : (
            <span className="px-2 py-px text-muted-foreground">
              {placeholder}
            </span>
          )}
        </TagsTrigger>
        <TagsContent>
          <TagsInput
            onValueChange={setSearchValue}
            placeholder="Search categories..."
            value={searchValue}
          />
          <TagsList>
            {availableCategories.length === 0 ? (
              <TagsEmpty>No categories found.</TagsEmpty>
            ) : (
              <TagsGroup>
                {availableCategories.map((category) => (
                  <TagsItem
                    key={category.id}
                    onSelect={() => handleSelect(category.id)}
                  >
                    {category.name}
                  </TagsItem>
                ))}
              </TagsGroup>
            )}
          </TagsList>
        </TagsContent>
      </Tags>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
