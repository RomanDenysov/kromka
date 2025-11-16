"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { updateCategory } from "@/app/(admin)/admin/categories/[id]/actions";
import type { Category } from "@/types/categories";
import { categorySchema } from "../../../../../components/forms/schemas";
import { Button } from "../../../../../components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../../../../components/ui/field";
import { Input } from "../../../../../components/ui/input";
import { NumberInput } from "../../../../../components/ui/number-input";
import { Switch } from "../../../../../components/ui/switch";
import { Textarea } from "../../../../../components/ui/textarea";

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryForm({ category }: { category: Category }) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      isVisible: category.isVisible,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    },
  });

  const onSubmit = useCallback(
    async (values: CategoryFormValues) => {
      await updateCategory(category.id, {
        ...values,
        sortOrder: Number(values.sortOrder),
      });
    },
    [category.id]
  );

  return (
    <form
      className="flex size-full max-w-md flex-col"
      id="category-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <FieldLegend>Upraviť kategóriu</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Názov</FieldLabel>
            <Input
              defaultValue={category.name}
              disabled={form.formState.isSubmitting}
              name="name"
              placeholder="Názov kategórie"
              required
            />
            {form.formState.errors.name && (
              <FieldError
                errors={[{ message: form.formState.errors.name.message }]}
              />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              defaultValue={category.slug}
              disabled={form.formState.isSubmitting}
              name="slug"
              placeholder="Slug kategórie"
            />
            {form.formState.errors.slug && (
              <FieldError
                errors={[{ message: form.formState.errors.slug.message }]}
              />
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Popis</FieldLabel>
            <Textarea
              defaultValue={category.description}
              disabled={form.formState.isSubmitting}
              name="description"
              placeholder="Popis kategórie"
            />
            {form.formState.errors.description && (
              <FieldError
                errors={[
                  { message: form.formState.errors.description.message },
                ]}
              />
            )}
          </Field>
          <Field className="rounded-md border p-3" orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="isVisible">Viditeľná</FieldLabel>
              <FieldDescription>Je kategória viditeľná?</FieldDescription>
            </FieldContent>
            <Switch
              defaultChecked={form.formState.defaultValues?.isVisible}
              disabled={form.formState.isSubmitting}
              id="isVisible"
              name="isVisible"
            />
            {form.formState.errors.isVisible && (
              <FieldError
                errors={[{ message: form.formState.errors.isVisible.message }]}
              />
            )}
          </Field>
          <Field className="rounded-md border p-3" orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="isActive">Aktívna</FieldLabel>
              <FieldDescription>Je kategória aktívna?</FieldDescription>
            </FieldContent>

            <Switch
              defaultChecked={form.formState.defaultValues?.isActive}
              disabled={form.formState.isSubmitting}
              id="isActive"
              name="isActive"
            />
            {form.formState.errors.isActive && (
              <FieldError
                errors={[{ message: form.formState.errors.isActive.message }]}
              />
            )}
          </Field>
          <Field className="rounded-md border p-3" orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="sortOrder">Poradie</FieldLabel>
              <FieldDescription>Poradie kategórie v menu</FieldDescription>
            </FieldContent>
            <NumberInput
              defaultValue={category.sortOrder}
              id="sortOrder"
              max={10}
              min={0}
              size="xs"
              step={1}
            />
            {form.formState.errors.sortOrder && (
              <FieldError
                errors={[{ message: form.formState.errors.sortOrder.message }]}
              />
            )}
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={form.formState.isSubmitting}
          form="category-form"
          type="submit"
        >
          {form.formState.isSubmitting ? "Aktualizovanie..." : "Aktualizovať"}
        </Button>
      </div>
    </form>
  );
}
