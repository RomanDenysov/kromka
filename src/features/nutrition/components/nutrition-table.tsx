import type { NutritionPer100Schema } from "@/features/ingredients/schema";
import { kJFromKcal } from "@/features/recipes/lib/nutrition-math";

interface Props {
  className?: string;
  heading?: string | null;
  nutrition: NutritionPer100Schema | null;
  source: "computed" | "override" | "none";
}

/**
 * EU 1169/2011 nutrition declaration per 100 g. Slovak labels + decimal
 * comma formatting. Returns null when no nutrition data is available —
 * silence is the right UX for products without recipe + override.
 */
export function NutritionTable({
  nutrition,
  source,
  className,
  heading = "Nutričné hodnoty na 100 g",
}: Props) {
  if (!nutrition || source === "none") {
    return null;
  }

  const kJ = kJFromKcal(nutrition.kcal);

  return (
    <section className={className}>
      {heading ? (
        <h3 className="mb-3 font-semibold text-sm tracking-tight">{heading}</h3>
      ) : null}
      <table className="w-full border-collapse text-sm">
        <tbody>
          <Row label="Energia" value={`${kJ} kJ / ${nutrition.kcal} kcal`} />
          <Row label="Tuky" value={`${formatG(nutrition.fat)} g`} />
          <Row
            indent
            label="z toho nasýtené mastné kyseliny"
            value={`${formatG(nutrition.saturatedFat)} g`}
          />
          <Row label="Sacharidy" value={`${formatG(nutrition.carbs)} g`} />
          <Row
            indent
            label="z toho cukry"
            value={`${formatG(nutrition.sugar)} g`}
          />
          <Row label="Vláknina" value={`${formatG(nutrition.fiber)} g`} />
          <Row label="Bielkoviny" value={`${formatG(nutrition.protein)} g`} />
          <Row label="Soľ" value={`${formatSalt(nutrition.salt)} g`} />
        </tbody>
      </table>
      <p className="mt-2 text-muted-foreground text-xs">
        {source === "override"
          ? "Hodnoty zadané manuálne."
          : "Hodnoty vypočítané z receptu."}
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  indent,
}: {
  label: string;
  value: string;
  indent?: boolean;
}) {
  return (
    <tr className="border-b last:border-b-0">
      <td
        className={
          indent ? "py-1.5 pl-4 text-muted-foreground" : "py-1.5 font-medium"
        }
      >
        {label}
      </td>
      <td className="py-1.5 text-right tabular-nums">{value}</td>
    </tr>
  );
}

function formatG(n: number): string {
  return n.toFixed(1).replace(".", ",");
}
function formatSalt(n: number): string {
  return n.toFixed(2).replace(".", ",");
}
