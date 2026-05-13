"use client";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { NutritionPer100Schema } from "../schema";

type NullableNutrition = Partial<NutritionPer100Schema> | null;

interface Props {
  onChange: (next: NullableNutrition) => void;
  readOnly?: boolean;
  value: NullableNutrition;
}

const FIELDS: Array<{
  key: keyof NutritionPer100Schema;
  label: string;
  unit: string;
  step?: string;
  indent?: boolean;
}> = [
  { key: "kcal", label: "Energia", unit: "kcal", step: "1" },
  { key: "protein", label: "Bielkoviny", unit: "g", step: "0.1" },
  { key: "fat", label: "Tuky", unit: "g", step: "0.1" },
  {
    key: "saturatedFat",
    label: "z toho nasýtené",
    unit: "g",
    step: "0.1",
    indent: true,
  },
  { key: "carbs", label: "Sacharidy", unit: "g", step: "0.1" },
  {
    key: "sugar",
    label: "z toho cukry",
    unit: "g",
    step: "0.1",
    indent: true,
  },
  { key: "fiber", label: "Vláknina", unit: "g", step: "0.1" },
  { key: "salt", label: "Soľ", unit: "g", step: "0.01" },
];

/**
 * Eight EU-mandatory nutrition fields per 100 g. Controlled component;
 * parent owns the value. Returns null when all fields are empty,
 * so the form can persist null when the admin clears everything.
 */
export function NutritionFields({ value, onChange, readOnly = false }: Props) {
  const get = (key: keyof NutritionPer100Schema): string => {
    const n = value?.[key];
    return n === undefined || n === null ? "" : String(n);
  };

  const update = (key: keyof NutritionPer100Schema, raw: string) => {
    const n = raw === "" ? null : Number(raw.replace(",", "."));
    const next: Partial<NutritionPer100Schema> = {
      ...(value ?? {}),
      [key]: n === null || Number.isNaN(n) ? undefined : n,
    };
    // Drop empty fields. If everything is empty, return null.
    const hasAny = Object.values(next).some(
      (x) => typeof x === "number" && Number.isFinite(x)
    );
    onChange(hasAny ? next : null);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {FIELDS.map((f) => (
        <Field key={f.key} orientation="responsive">
          <FieldContent>
            <FieldLabel
              className={f.indent ? "pl-4 text-muted-foreground" : ""}
            >
              {f.label}
            </FieldLabel>
          </FieldContent>
          <div className="flex items-center gap-2">
            <Input
              className="w-24"
              disabled={readOnly}
              inputMode="decimal"
              onChange={(e) => update(f.key, e.target.value)}
              step={f.step}
              type="number"
              value={get(f.key)}
            />
            <span className="text-muted-foreground text-sm">{f.unit}</span>
          </div>
        </Field>
      ))}
    </div>
  );
}
