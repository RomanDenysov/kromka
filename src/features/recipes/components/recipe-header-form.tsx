"use client";

import { CheckIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { publishRecipeAction, updateRecipeHeaderAction } from "../api/actions";
import type { RecipeHeaderSchema } from "../schema";

interface Props {
  initial: RecipeHeaderSchema;
  /** Called when the admin edits header values; parent uses for live preview. */
  onChange: (next: RecipeHeaderSchema) => void;
  recipeId: string;
}

export function RecipeHeaderForm({ recipeId, initial, onChange }: Props) {
  const [state, setState] = useState<RecipeHeaderSchema>(initial);
  const [saving, startSave] = useTransition();
  const [publishing, startPublish] = useTransition();

  const update = <K extends keyof RecipeHeaderSchema>(
    key: K,
    value: RecipeHeaderSchema[K]
  ) => {
    const next = { ...state, [key]: value };
    setState(next);
    onChange(next);
  };

  const handleSave = () => {
    startSave(async () => {
      const res = await updateRecipeHeaderAction({ id: recipeId, data: state });
      if (res.success) {
        toast.success("Recept uložený");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handlePublish = () => {
    startPublish(async () => {
      const res = await publishRecipeAction({ id: recipeId });
      if (res.success) {
        toast.success("Recept publikovaný");
        setState((prev) => ({ ...prev, status: "published" }));
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <FieldSet className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>Recept</FieldLabel>
        <div className="flex items-center gap-2">
          {state.status === "draft" && (
            <Button
              disabled={publishing}
              onClick={handlePublish}
              size="sm"
              type="button"
              variant="outline"
            >
              {publishing ? <Spinner /> : <CheckIcon className="mr-1 size-4" />}
              Publikovať
            </Button>
          )}
          <Button
            disabled={saving}
            onClick={handleSave}
            size="sm"
            type="button"
          >
            {saving && <Spinner />}
            Uložiť
          </Button>
        </div>
      </div>

      <FieldGroup className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="rec-name">Názov</FieldLabel>
          </FieldContent>
          <Input
            id="rec-name"
            onChange={(e) => update("name", e.target.value)}
            value={state.name}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel htmlFor="rec-slug">Slug</FieldLabel>
          </FieldContent>
          <Input
            id="rec-slug"
            onChange={(e) => update("slug", e.target.value)}
            value={state.slug}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel>Typ</FieldLabel>
            <FieldDescription>
              „Produkt" je finálny recept; „Subrecept" sa znova používa v iných
              receptoch (kvások, krém...).
            </FieldDescription>
          </FieldContent>
          <Select
            onValueChange={(v) => update("kind", v as "product" | "sub_recipe")}
            value={state.kind}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Produkt (finálny)</SelectItem>
              <SelectItem value="sub_recipe">Subrecept</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel>Stav</FieldLabel>
          </FieldContent>
          <Select
            onValueChange={(v) => update("status", v as "draft" | "published")}
            value={state.status}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Koncept</SelectItem>
              <SelectItem value="published">Publikovaný</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel htmlFor="rec-yield-units">Výnos (ks)</FieldLabel>
            <FieldDescription>
              Koľko kusov produkuje jedna šarža.
            </FieldDescription>
          </FieldContent>
          <Input
            id="rec-yield-units"
            inputMode="numeric"
            onChange={(e) =>
              update(
                "batchYieldUnits",
                Number.parseInt(e.target.value, 10) || 1
              )
            }
            type="number"
            value={state.batchYieldUnits}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel htmlFor="rec-yield-grams">
              Hmotnosť šarže (g)
            </FieldLabel>
            <FieldDescription>
              Súčet hmotnosti pred pečením; použité pre nutričné hodnoty.
            </FieldDescription>
          </FieldContent>
          <Input
            id="rec-yield-grams"
            inputMode="numeric"
            onChange={(e) =>
              update(
                "batchYieldGrams",
                Number.parseInt(e.target.value, 10) || 0
              )
            }
            type="number"
            value={state.batchYieldGrams}
          />
        </Field>

        <Field>
          <FieldContent>
            <FieldLabel htmlFor="rec-loss">Strata (%)</FieldLabel>
            <FieldDescription>
              Strata hmotnosti pri pečení (typicky 10-12 %).
            </FieldDescription>
          </FieldContent>
          <Input
            id="rec-loss"
            inputMode="numeric"
            max={50}
            min={0}
            onChange={(e) =>
              update(
                "yieldLossPercent",
                Math.max(
                  0,
                  Math.min(50, Number.parseInt(e.target.value, 10) || 0)
                )
              )
            }
            type="number"
            value={state.yieldLossPercent}
          />
        </Field>

        <Field className="md:col-span-2">
          <FieldContent>
            <FieldLabel htmlFor="rec-notes">Poznámky</FieldLabel>
          </FieldContent>
          <Textarea
            id="rec-notes"
            onChange={(e) => update("notes", e.target.value || null)}
            rows={2}
            value={state.notes ?? ""}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
