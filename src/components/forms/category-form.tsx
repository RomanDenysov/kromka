"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { updateCategory } from "@/app/(admin)/admin/categories/[id]/actions";
import type { Category } from "@/types/categories";
import { Button } from "../ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { categorySchema } from "./schemas";

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
      className="max-w-md p-2"
      id="category-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <FieldLegend>Kategória</FieldLegend>
        <FieldGroup>
          <Field id="name">
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
          <Field id="slug">
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
          <Field id="description">
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
          <Field id="isVisible" orientation="horizontal">
            <FieldLabel htmlFor="isVisible">Viditeľná</FieldLabel>
            <Switch
              defaultChecked={form.formState.defaultValues?.isVisible}
              disabled={form.formState.isSubmitting}
              name="isVisible"
            />
            {form.formState.errors.isVisible && (
              <FieldError
                errors={[{ message: form.formState.errors.isVisible.message }]}
              />
            )}
          </Field>
          <Field id="isActive" orientation="horizontal">
            <FieldLabel htmlFor="isActive">Aktívna</FieldLabel>

            <Switch
              defaultChecked={form.formState.defaultValues?.isActive}
              disabled={form.formState.isSubmitting}
              name="isActive"
            />
            {form.formState.errors.isActive && (
              <FieldError
                errors={[{ message: form.formState.errors.isActive.message }]}
              />
            )}
          </Field>
          <Field id="sortOrder" orientation="horizontal">
            <FieldLabel htmlFor="sortOrder">Poradie</FieldLabel>
            <Input
              defaultValue={form.formState.defaultValues?.sortOrder}
              disabled={form.formState.isSubmitting}
              name="sortOrder"
              placeholder="Poradie kategórie"
              type="number"
            />
            {form.formState.errors.sortOrder && (
              <FieldError
                errors={[{ message: form.formState.errors.sortOrder.message }]}
              />
            )}
          </Field>
        </FieldGroup>
      </FieldSet>
      <Button disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Aktualizovanie..." : "Aktualizovať"}
      </Button>
    </form>
  );
}
