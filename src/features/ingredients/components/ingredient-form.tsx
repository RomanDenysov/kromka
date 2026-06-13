"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Allergen } from "@/features/allergens/api/queries";
import { AllergenChipStrip } from "@/features/allergens/components/allergen-picker";
import { ALLERGEN_ICONS } from "@/features/allergens/lib/icons";
import type { AllergenCode } from "@/features/allergens/schema";
import { cn } from "@/lib/utils";
import {
  createIngredientAction,
  deleteIngredientAction,
  findSimilarIngredientsAction,
  setIngredientActiveAction,
  updateIngredientAction,
} from "../api/actions";
import type { Ingredient } from "../api/queries";
import { suggestAllergens } from "../lib/allergen-defaults";
import type { IngredientSchema } from "../schema";
import { AiSuggestionDialog } from "./ai-suggestion-dialog";
import { DuplicateSuggestion } from "./duplicate-suggestion";
import { NutritionFields } from "./nutrition-fields";
import { PriceInput } from "./price-input";

type FormState = IngredientSchema;

interface Props {
  allergens: Allergen[];
  initial?: Ingredient;
  onSaved?: (ingredient: { id: string; name: string }) => void;
  variant?: "page" | "sheet";
}

/**
 * Ingredient form, dual-mode: "page" (full standalone editor) and
 * "sheet" (compact, used by Phase C's recipe builder inline-create flow).
 */
export function IngredientForm({
  initial,
  allergens,
  variant = "page",
  onSaved,
}: Props) {
  const router = useRouter();
  const isCreate = !initial;

  const [state, setState] = useState<FormState>(() =>
    seedState(initial, allergens)
  );
  const [submitting, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const suggested = suggestAllergens(state.name).filter(
    (c) => !(state.allergenCodes as readonly string[]).includes(c)
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const toggleAllergen = (code: AllergenCode) => {
    const has = (state.allergenCodes as readonly string[]).includes(code);
    update(
      "allergenCodes",
      has
        ? state.allergenCodes.filter((c) => c !== code)
        : [...state.allergenCodes, code]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (isCreate) {
        const res = await createIngredientAction(state);
        if (res.success) {
          toast.success("Surovina vytvorená");
          onSaved?.(res.ingredient);
          if (variant === "page") {
            router.push(`/admin/production/ingredients/${res.ingredient.id}`);
          }
        } else {
          toast.error(res.error);
        }
      } else {
        const res = await updateIngredientAction({
          id: initial.id,
          data: state,
        });
        if (res.success) {
          toast.success("Surovina uložená");
          router.refresh();
        } else {
          toast.error(res.error);
        }
      }
    });
  };

  const handleDelete = async () => {
    if (!initial) {
      return;
    }
    setDeleting(true);
    try {
      const res = await deleteIngredientAction({ id: initial.id });
      if (res.success) {
        toast.success("Surovina odstránená");
        router.push("/admin/production/ingredients");
      } else {
        toast.error(res.error);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!initial) {
      update("isActive", !state.isActive);
      return;
    }
    const next = !state.isActive;
    update("isActive", next);
    const res = await setIngredientActiveAction({
      id: initial.id,
      isActive: next,
    });
    if (!res.success) {
      toast.error(res.error);
      update("isActive", !next);
    }
  };

  return (
    <form
      className={cn("grid gap-6", variant === "page" ? "max-w-3xl p-4" : "p-4")}
      onSubmit={handleSubmit}
    >
      {/* Basic info */}
      <FieldSet>
        <FieldLabel>Základné údaje</FieldLabel>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="ing-name">Názov</FieldLabel>
            </FieldContent>
            <Input
              id="ing-name"
              onChange={(e) => update("name", e.target.value)}
              placeholder="Hladká múka T650"
              value={state.name}
            />
            {isCreate && (
              <DuplicateSuggestion
                fetcher={findSimilarIngredientsAction}
                name={state.name}
              />
            )}
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel htmlFor="ing-slug">Slug</FieldLabel>
            </FieldContent>
            <Input
              id="ing-slug"
              onChange={(e) => update("slug", e.target.value)}
              value={state.slug}
            />
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel htmlFor="ing-supplier">Dodávateľ</FieldLabel>
              <FieldDescription>Nepovinné</FieldDescription>
            </FieldContent>
            <Input
              id="ing-supplier"
              onChange={(e) => update("supplierName", e.target.value || null)}
              value={state.supplierName ?? ""}
            />
          </Field>

          <Field className="md:col-span-2">
            <FieldContent>
              <FieldLabel htmlFor="ing-notes">Poznámky</FieldLabel>
            </FieldContent>
            <Textarea
              id="ing-notes"
              onChange={(e) => update("notes", e.target.value || null)}
              rows={2}
              value={state.notes ?? ""}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Unit + price */}
      <FieldSet>
        <FieldLabel>Jednotka a cena</FieldLabel>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldContent>
              <FieldLabel>Základná jednotka</FieldLabel>
              <FieldDescription>
                Hmotnostné suroviny: g. Kusové: piece (vajcia, citróny).
              </FieldDescription>
            </FieldContent>
            <Select
              onValueChange={(v) => {
                const baseUnit = v as "g" | "piece";
                // When switching units, clear the off-axis price so the
                // XOR CHECK is satisfied.
                update("baseUnit", baseUnit);
                if (baseUnit === "g") {
                  update("pricePerPieceCents", null);
                  if (state.pricePerKgCents === null) {
                    update("pricePerKgCents", 0);
                  }
                } else {
                  update("pricePerKgCents", null);
                  if (state.pricePerPieceCents === null) {
                    update("pricePerPieceCents", 0);
                  }
                }
              }}
              value={state.baseUnit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Hmotnosť (g)</SelectItem>
                <SelectItem value="piece">Kus (piece)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {state.baseUnit === "piece" && (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="ing-gpp">Hmotnosť na kus (g)</FieldLabel>
                <FieldDescription>
                  Použité pre prepočet nutrície (napr. vajce M = 50 g).
                </FieldDescription>
              </FieldContent>
              <Input
                id="ing-gpp"
                inputMode="numeric"
                onChange={(e) =>
                  update(
                    "gramsPerPiece",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="50"
                type="number"
                value={state.gramsPerPiece ?? ""}
              />
            </Field>
          )}

          <Field className="md:col-span-2">
            <PriceInput
              baseUnit={state.baseUnit}
              description="Zadajte sumu v jednotke, ktorú máte na faktúre. Uložené ako cents/kg alebo cents/ks."
              onChange={({ pricePerKgCents, pricePerPieceCents }) => {
                setState((s) => ({
                  ...s,
                  pricePerKgCents,
                  pricePerPieceCents,
                }));
              }}
              pricePerKgCents={state.pricePerKgCents}
              pricePerPieceCents={state.pricePerPieceCents}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      {/* Allergens */}
      <FieldSet>
        <FieldLabel>Alergény</FieldLabel>
        <FieldDescription>
          Označte alergény, ktoré surovina obsahuje. Po pridaní surovín do
          receptu sa alergény odovzdajú produktu automaticky.
        </FieldDescription>

        {suggested.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs dark:border-amber-800 dark:bg-amber-950">
            <p className="mb-1 text-amber-700 dark:text-amber-300">
              Navrhnuté podľa názvu:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((code) => {
                const a = allergens.find((x) => x.code === code);
                if (!a) {
                  return null;
                }
                const Icon = ALLERGEN_ICONS[code];
                return (
                  <button
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs hover:bg-accent"
                    key={code}
                    onClick={() => toggleAllergen(code)}
                    type="button"
                  >
                    <Icon className="size-3" />
                    {a.nameSk} +
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {allergens.map((a) => {
            const Icon = ALLERGEN_ICONS[a.code as AllergenCode];
            const selected = (
              state.allergenCodes as readonly string[]
            ).includes(a.code);
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-input bg-background hover:bg-accent"
                )}
                key={a.code}
                onClick={() => toggleAllergen(a.code as AllergenCode)}
                type="button"
              >
                <Icon className="size-3.5" />
                {a.nameSk}
              </button>
            );
          })}
        </div>

        {state.allergenCodes.length > 0 && (
          <AllergenChipStrip
            allergens={allergens}
            codes={state.allergenCodes}
          />
        )}
      </FieldSet>

      {/* Nutrition */}
      <FieldSet>
        <div className="flex items-center justify-between gap-2">
          <div>
            <FieldLabel>Nutričné hodnoty (na 100 g)</FieldLabel>
            <FieldDescription>
              Energia, makroživiny a soľ. Použité pre výpočet nutrície hotových
              produktov (Phase D).
            </FieldDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Zdroj: {sourceLabel(state.nutritionSource)}
            </Badge>
            {!isCreate && initial && (
              <AiSuggestionDialog
                current={state.nutritionPer100}
                ingredientId={initial.id}
                onApply={(s) => {
                  const { confidence, source, ...nutrition } = s;
                  setState((prev) => ({
                    ...prev,
                    nutritionPer100: nutrition,
                    nutritionSource: "ai",
                  }));
                  toast.info(
                    `Návrh AI použitý (spoľahlivosť: ${confidence}, zdroj: ${source})`
                  );
                }}
              />
            )}
          </div>
        </div>
        <NutritionFields
          onChange={(next) => {
            setState((prev) => ({
              ...prev,
              nutritionPer100: next as IngredientSchema["nutritionPer100"],
              // If admin edits values manually, mark source as manual
              nutritionSource:
                prev.nutritionSource === "ai" ? prev.nutritionSource : "manual",
            }));
          }}
          value={state.nutritionPer100}
        />
      </FieldSet>

      {/* Visibility + actions */}
      {variant === "page" && (
        <FieldSet>
          <FieldLabel>Stav</FieldLabel>
          <Field orientation="horizontal">
            <Switch
              checked={state.isActive}
              id="ing-active"
              onCheckedChange={handleToggleActive}
            />
            <FieldContent>
              <FieldLabel htmlFor="ing-active">Aktívna</FieldLabel>
              <FieldDescription>
                Neaktívne suroviny sa nezobrazujú v pickeri receptov.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldSet>
      )}

      <div className="flex items-center justify-end gap-2">
        {variant === "page" && initial && (
          <Button
            disabled={deleting || submitting}
            onClick={handleDelete}
            size="sm"
            type="button"
            variant="outline"
          >
            <Trash2Icon className="mr-1.5 size-4" />
            Odstrániť
          </Button>
        )}
        <Button disabled={submitting} size="sm" type="submit">
          {submitting && <Spinner />}
          {isCreate ? "Vytvoriť" : "Uložiť"}
        </Button>
      </div>
    </form>
  );
}

function sourceLabel(s: IngredientSchema["nutritionSource"]): string {
  switch (s) {
    case "ai":
      return "AI";
    case "supplier":
      return "Dodávateľ";
    case "seed":
      return "Seed";
    default:
      return "Manuálne";
  }
}

function seedState(
  initial: Ingredient | undefined,
  _allergens: Allergen[]
): FormState {
  if (initial) {
    return {
      name: initial.name,
      slug: initial.slug,
      baseUnit: initial.baseUnit,
      gramsPerPiece: initial.gramsPerPiece,
      pricePerKgCents: initial.pricePerKgCents,
      pricePerPieceCents: initial.pricePerPieceCents,
      supplierName: initial.supplierName,
      allergenCodes: initial.allergenCodes as AllergenCode[],
      nutritionPer100: initial.nutritionPer100,
      nutritionSource: initial.nutritionSource,
      notes: initial.notes,
      isActive: initial.isActive,
    };
  }
  return {
    name: "",
    slug: "",
    baseUnit: "g",
    gramsPerPiece: null,
    pricePerKgCents: 0,
    pricePerPieceCents: null,
    supplierName: null,
    allergenCodes: [],
    nutritionPer100: null,
    nutritionSource: "manual",
    notes: null,
    isActive: true,
  };
}
