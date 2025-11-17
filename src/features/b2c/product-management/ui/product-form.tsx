"use client";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const _STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export function ProductForm() {
  return (
    <form id="product-form">
      <FieldSet>
        <FieldLegend>Produkt</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Názov</FieldLabel>
            <Input id="name" name="name" placeholder="Názov produktu" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
