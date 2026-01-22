"use client";

import type { FieldValues } from "react-hook-form";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import {
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

type Props = {
  titleName?: string;
  descriptionName?: string;
};

export function SeoFields<T extends FieldValues>({
  titleName = "metaTitle",
  descriptionName = "metaDescription",
}: Props) {
  return (
    <FieldSet className="gap-4">
      <div className="space-y-1">
        <FieldLabel>SEO nastavenia</FieldLabel>
        <FieldDescription>
          Meta title a description pre vyhľadávače. Ak nie sú vyplnené, použije
          sa názov a excerpt článku.
        </FieldDescription>
      </div>
      <div className="grid gap-4">
        <TextField<T>
          description="Odporúčaná dĺžka: 50-60 znakov"
          label="Meta title"
          maxLength={70}
          name={titleName as any}
          placeholder="SEO titulok článku"
        />
        <TextareaField<T>
          description="Odporúčaná dĺžka: 150-160 znakov"
          label="Meta description"
          name={descriptionName as any}
          placeholder="Krátky popis pre vyhľadávače..."
          rows={3}
        />
      </div>
    </FieldSet>
  );
}
