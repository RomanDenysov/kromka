"use client";

import { useEffect, useState } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import type { IngredientBaseUnit } from "@/db/schema";
import {
  formatCentsAsEur,
  MASS_INPUT_UNITS,
  MASS_UNIT_LABELS,
  type MassInputUnit,
  normalizePriceInput,
  PIECE_INPUT_UNITS,
  PIECE_UNIT_LABELS,
  type PieceInputUnit,
  type PriceInputUnit,
} from "../lib/price-conversion";

interface Props {
  baseUnit: IngredientBaseUnit;
  description?: string;
  label?: string;
  onChange: (next: {
    pricePerKgCents: number | null;
    pricePerPieceCents: number | null;
  }) => void;
  pricePerKgCents: number | null;
  pricePerPieceCents: number | null;
}

const DEFAULT_MASS_UNIT: MassInputUnit = "kg";
const DEFAULT_PIECE_UNIT: PieceInputUnit = "1piece";

/**
 * Unit-aware price input. Admin types whatever amount + chooses a unit
 * (kg / 500 g / 100 g / 1 piece / 12 pieces / ...). Component normalizes
 * to canonical cents/kg or cents/piece on every keystroke and reports
 * back via onChange. See docs/specs/_arc-overview.md §3.
 */
export function PriceInput({
  baseUnit,
  pricePerKgCents,
  pricePerPieceCents,
  onChange,
  label = "Cena",
  description,
}: Props) {
  // Track the displayed amount in EUR (string for input control)
  // and the currently-selected input unit.
  const [unit, setUnit] = useState<PriceInputUnit>(
    baseUnit === "g" ? DEFAULT_MASS_UNIT : DEFAULT_PIECE_UNIT
  );
  const [amountStr, setAmountStr] = useState<string>(() =>
    seedAmount(baseUnit, pricePerKgCents, pricePerPieceCents, unit)
  );

  // When baseUnit switches, reset the unit selector to a valid value.
  useEffect(() => {
    if (baseUnit === "g" && !isMassUnit(unit)) {
      setUnit(DEFAULT_MASS_UNIT);
    }
    if (baseUnit === "piece" && isMassUnit(unit)) {
      setUnit(DEFAULT_PIECE_UNIT);
    }
  }, [baseUnit, unit]);

  const stored = baseUnit === "g" ? pricePerKgCents : pricePerPieceCents;
  const storedLabel = baseUnit === "g" ? "c/kg" : "c/ks";

  const handleAmount = (raw: string) => {
    const filtered = raw.replace(/[^\d.,]/g, "").replace(",", ".");
    setAmountStr(raw);
    const amountEur = filtered === "" ? 0 : Number(filtered);
    const { kg, piece } = normalizePriceInput({
      amountEur,
      inputUnit: unit,
      baseUnit,
    });
    onChange({ pricePerKgCents: kg, pricePerPieceCents: piece });
  };

  const handleUnit = (nextUnit: string) => {
    setUnit(nextUnit as PriceInputUnit);
    const amountEur =
      amountStr === "" ? 0 : Number(amountStr.replace(",", "."));
    const { kg, piece } = normalizePriceInput({
      amountEur,
      inputUnit: nextUnit as PriceInputUnit,
      baseUnit,
    });
    onChange({ pricePerKgCents: kg, pricePerPieceCents: piece });
  };

  const options =
    baseUnit === "g"
      ? MASS_INPUT_UNITS.map((u) => ({ value: u, label: MASS_UNIT_LABELS[u] }))
      : PIECE_INPUT_UNITS.map((u) => ({
          value: u,
          label: PIECE_UNIT_LABELS[u],
        }));

  return (
    <Field orientation="responsive">
      <FieldContent>
        <FieldLabel>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        <p className="text-muted-foreground text-xs">
          Uložené ako:{" "}
          <span className="font-mono">
            {stored === null ? "—" : `${stored} ${storedLabel}`}
          </span>
          {stored !== null && baseUnit === "g" && (
            <span className="ml-2">({formatCentsAsEur(stored)} / kg)</span>
          )}
          {stored !== null && baseUnit === "piece" && (
            <span className="ml-2">({formatCentsAsEur(stored)} / ks)</span>
          )}
        </p>
      </FieldContent>
      <div className="flex items-center gap-2">
        <Input
          aria-label="Suma v eurách"
          className="w-24"
          inputMode="decimal"
          onChange={(e) => handleAmount(e.target.value)}
          placeholder="0,00"
          value={amountStr}
        />
        <span className="text-muted-foreground">€ za</span>
        <Select onValueChange={handleUnit} value={unit}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}

function isMassUnit(u: PriceInputUnit): u is MassInputUnit {
  return (MASS_INPUT_UNITS as readonly string[]).includes(u);
}

/**
 * Seed the displayed amount string from the stored canonical value, so
 * the form's initial render shows the right number+unit for the user.
 */
function seedAmount(
  baseUnit: IngredientBaseUnit,
  perKg: number | null,
  perPiece: number | null,
  unit: PriceInputUnit
): string {
  if (baseUnit === "g") {
    if (perKg === null || perKg === 0) {
      return "";
    }
    let cents: number;
    switch (unit) {
      case "500g":
        cents = Math.round((perKg * 500) / 1000);
        break;
      case "100g":
        cents = Math.round((perKg * 100) / 1000);
        break;
      default:
        cents = perKg;
    }
    return (cents / 100).toFixed(2).replace(".", ",");
  }
  if (perPiece === null || perPiece === 0) {
    return "";
  }
  let cents: number;
  switch (unit) {
    case "12pieces":
      cents = perPiece * 12;
      break;
    case "10pieces":
      cents = perPiece * 10;
      break;
    case "6pieces":
      cents = perPiece * 6;
      break;
    default:
      cents = perPiece;
  }
  return (cents / 100).toFixed(2).replace(".", ",");
}
