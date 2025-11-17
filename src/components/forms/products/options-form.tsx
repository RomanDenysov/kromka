"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { productStatusEnum } from "@/db/schema/enums";
import { cn } from "@/lib/utils";
import type { ProductFormValues } from ".";

export function OptionsForm({ className }: { className?: string }) {
  const form = useFormContext<ProductFormValues>();
  return (
    <FieldGroup className={cn("max-w-sm p-3 xl:max-w-md", className)}>
      <div className="flex gap-3">
        <Controller
          control={form.control}
          name="stock"
          render={({ field, fieldState }) => (
            <Field
              className="rounded-md border p-3"
              data-invalid={fieldState.invalid}
              orientation="horizontal"
            >
              <FieldLabel htmlFor="stock">Množstvo</FieldLabel>
              <Input
                {...field}
                className="w-fit"
                id="stock"
                max={1000}
                min={0}
                name="stock"
                placeholder="0-1000"
                required
                step={1}
                type="number"
                volume="sm"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="sortOrder"
          render={({ field, fieldState }) => (
            <Field
              className="rounded-md border p-3"
              data-invalid={fieldState.invalid}
              orientation="horizontal"
            >
              <FieldLabel htmlFor="sortOrder">Poradie</FieldLabel>
              <Input
                {...field}
                className="w-fit"
                id="sortOrder"
                max={100}
                min={0}
                name="sortOrder"
                placeholder="0-100"
                required
                step={1}
                type="number"
                volume="sm"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        control={form.control}
        name="isActive"
        render={({ field, fieldState }) => (
          <Field
            className="rounded-md border p-3"
            data-invalid={fieldState.invalid}
            orientation="horizontal"
          >
            <FieldContent>
              <FieldLabel htmlFor="isActive">Aktívny</FieldLabel>
              <FieldDescription>Je produkt aktívny?</FieldDescription>
            </FieldContent>
            <Switch
              checked={field.value}
              id="isActive"
              name="isActive"
              onCheckedChange={field.onChange}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="status"
        render={({ field, fieldState }) => (
          <Field
            className="rounded-md border p-3"
            data-invalid={fieldState.invalid}
            orientation="horizontal"
          >
            <FieldContent>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <FieldDescription>
                Zobraziť produkt na stránkach?
              </FieldDescription>
            </FieldContent>
            <Select
              {...field}
              name="status"
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger className="capitalize" size="sm">
                <SelectValue placeholder="Status produktu" />
              </SelectTrigger>
              <SelectContent align="end" position="popper">
                {productStatusEnum.enumValues.map((status) => (
                  <SelectItem
                    className="capitalize"
                    key={status}
                    value={status}
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
