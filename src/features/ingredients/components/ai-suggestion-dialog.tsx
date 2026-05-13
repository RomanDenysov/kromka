"use client";

import { SparklesIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { aiAutofillNutritionAction } from "../api/actions";
import type { AiNutritionSuggestion, NutritionPer100Schema } from "../schema";

const FIELD_LABELS: Array<{
  key: keyof NutritionPer100Schema;
  label: string;
  unit: string;
}> = [
  { key: "kcal", label: "Energia", unit: "kcal" },
  { key: "protein", label: "Bielkoviny", unit: "g" },
  { key: "fat", label: "Tuky", unit: "g" },
  { key: "saturatedFat", label: "nasýtené", unit: "g" },
  { key: "carbs", label: "Sacharidy", unit: "g" },
  { key: "sugar", label: "cukry", unit: "g" },
  { key: "fiber", label: "Vláknina", unit: "g" },
  { key: "salt", label: "Soľ", unit: "g" },
];

interface Props {
  current: Partial<NutritionPer100Schema> | null;
  disabled?: boolean;
  disabledReason?: string;
  ingredientId: string;
  /** Called when admin confirms; parent applies via updateIngredientAction. */
  onApply: (suggestion: AiNutritionSuggestion) => void;
}

/**
 * `[Vyplniť pomocou AI]` button + confirmation dialog.
 *
 * Flow:
 * 1. Click button → call aiAutofillNutritionAction (read-only)
 * 2. Show suggested values side-by-side with current
 * 3. Admin confirms → onApply → parent persists via updateIngredientAction
 */
export function AiSuggestionDialog({
  ingredientId,
  current,
  onApply,
  disabled,
  disabledReason,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AiNutritionSuggestion | null>(
    null
  );

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSuggestion(null);
      return;
    }
    // Trigger the AI call when the dialog opens.
    setLoading(true);
    setSuggestion(null);
    try {
      const result = await aiAutofillNutritionAction({ ingredientId });
      if (result.success) {
        setSuggestion(result.suggestion);
      } else {
        toast.error(result.error);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={disabled}
          size="sm"
          title={disabledReason}
          type="button"
          variant="outline"
        >
          <SparklesIcon className="mr-1.5 size-4" />
          Vyplniť pomocou AI
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Návrh nutričných hodnôt</AlertDialogTitle>
          <AlertDialogDescription>
            AI navrhuje nasledujúce hodnoty na 100 g. Skontrolujte ich a
            potvrďte; potvrdením sa nahradia existujúce hodnoty.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Spinner /> Pýtam sa AI...
          </div>
        )}

        {suggestion && (
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Spoľahlivosť:</span>
              <Badge variant={confidenceVariant(suggestion.confidence)}>
                {confidenceLabel(suggestion.confidence)}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Zdroj: {suggestion.source}
            </p>
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs">
                <tr>
                  <th className="text-left">Hodnota</th>
                  <th className="text-right">Aktuálne</th>
                  <th className="text-right">Návrh</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_LABELS.map((f) => {
                  const cur = current?.[f.key];
                  const next = suggestion[f.key];
                  const changed = cur !== next;
                  return (
                    <tr className="border-t" key={f.key}>
                      <td className="py-1.5">{f.label}</td>
                      <td className="text-right text-muted-foreground">
                        {cur === undefined || cur === null
                          ? "—"
                          : `${cur} ${f.unit}`}
                      </td>
                      <td
                        className={
                          changed
                            ? "text-right font-medium"
                            : "text-right text-muted-foreground"
                        }
                      >
                        {next} {f.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Zrušiť</AlertDialogCancel>
          <AlertDialogAction
            disabled={!suggestion}
            onClick={() => {
              if (suggestion) {
                onApply(suggestion);
                setOpen(false);
              }
            }}
          >
            Použiť hodnoty
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function confidenceVariant(
  c: AiNutritionSuggestion["confidence"]
): "success" | "secondary" | "destructive" {
  if (c === "high") {
    return "success";
  }
  if (c === "medium") {
    return "secondary";
  }
  return "destructive";
}

function confidenceLabel(c: AiNutritionSuggestion["confidence"]): string {
  if (c === "high") {
    return "Vysoká";
  }
  if (c === "medium") {
    return "Stredná";
  }
  return "Nízka";
}
