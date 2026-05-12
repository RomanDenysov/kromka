"use client";

import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { Allergen } from "../api/queries";
import { ALLERGEN_ICONS } from "../lib/icons";
import type { AllergenCode } from "../schema";

interface AllergenPickerProps<T extends FieldValues> {
  allergens: Allergen[];
  className?: string;
  description?: string;
  label?: string;
  name: FieldPath<T>;
  /**
   * When true, picker renders read-only with a note pointing the admin
   * to the source. Phase D toggles this when a product has a recipe.
   */
  readOnly?: boolean;
  readOnlyNote?: string;
}

/**
 * Chip-toggle picker. RHF-controlled; takes the allergens reference list
 * as a prop so the form's container can fetch it server-side once.
 *
 * Sorting is canonical (driven by allergens.sortOrder).
 */
export function AllergenPicker<T extends FieldValues>({
  allergens,
  className,
  description,
  label = "Alergény",
  name,
  readOnly = false,
  readOnlyNote,
}: AllergenPickerProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: AllergenCode[] = field.value ?? [];
        const has = (code: string) =>
          (value as readonly string[]).includes(code);
        const toggle = (code: AllergenCode) => {
          if (readOnly) {
            return;
          }
          field.onChange(
            has(code) ? value.filter((c) => c !== code) : [...value, code]
          );
        };

        return (
          <Field
            className={className}
            data-invalid={fieldState.invalid ? "" : undefined}
          >
            <FieldContent>
              {label && <FieldLabel>{label}</FieldLabel>}
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              {readOnly && readOnlyNote && (
                <FieldDescription className="text-muted-foreground italic">
                  {readOnlyNote}
                </FieldDescription>
              )}

              <div className="flex flex-wrap gap-1.5">
                {allergens.map((a) => {
                  const Icon = ALLERGEN_ICONS[a.code as AllergenCode];
                  const selected = has(a.code);
                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-input bg-background hover:bg-accent",
                        readOnly && "cursor-default opacity-80"
                      )}
                      disabled={readOnly}
                      key={a.code}
                      onClick={() => toggle(a.code as AllergenCode)}
                      type="button"
                    >
                      <Icon className="size-3.5" />
                      {a.nameSk}
                    </button>
                  );
                })}
              </div>

              {value.length > 0 && (
                <p className="mt-1 text-muted-foreground text-xs">
                  Vybrané ({value.length}):{" "}
                  {allergens
                    .filter((a) => has(a.code))
                    .map((a) => a.nameSk)
                    .join(", ")}
                </p>
              )}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

/**
 * Read-only chip strip. Used in product summary cards or anywhere
 * the admin needs to glance at allergens without editing.
 */
export function AllergenChipStrip({
  allergens,
  codes,
  className,
}: {
  allergens: Allergen[];
  codes: AllergenCode[];
  className?: string;
}) {
  const present = allergens.filter((a) =>
    (codes as readonly string[]).includes(a.code)
  );
  if (present.length === 0) {
    return null;
  }
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {present.map((a) => {
        const Icon = ALLERGEN_ICONS[a.code as AllergenCode];
        return (
          <Badge className="gap-1" key={a.code} variant="secondary">
            <Icon className="size-3" />
            {a.nameSk}
          </Badge>
        );
      })}
    </div>
  );
}
