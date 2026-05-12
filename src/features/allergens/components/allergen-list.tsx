import { Badge } from "@/components/ui/badge";
import type { Allergen } from "../api/queries";
import { ALLERGEN_ICONS } from "../lib/icons";
import type { AllergenCode } from "../schema";

interface Props {
  allergens: Allergen[];
  className?: string;
  codes: AllergenCode[];
  heading?: string;
}

/**
 * Public PDP allergen list. Renders a labelled chip per allergen present
 * on the product. Returns null when there are no allergens — silence is
 * the right UX for products without tagged allergens.
 *
 * In Phase A the codes come from products.allergenCodes (manual tagging).
 * In Phase D, for products with a recipe, codes are derived from the
 * recipe ingredients. The component is unchanged in either case.
 */
export function AllergenList({
  codes,
  allergens,
  className,
  heading = "Alergény",
}: Props) {
  if (codes.length === 0) {
    return null;
  }

  // Lookup by code, preserve canonical sortOrder from the reference table
  const present = allergens.filter((a) =>
    (codes as readonly string[]).includes(a.code)
  );
  if (present.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h3 className="mb-3 font-semibold text-sm tracking-tight">{heading}</h3>
      <div className="flex flex-wrap gap-2">
        {present.map((a) => {
          const Icon = ALLERGEN_ICONS[a.code as AllergenCode];
          return (
            <Badge className="gap-1.5" key={a.code} variant="secondary">
              <Icon className="size-3.5" />
              {a.nameSk}
            </Badge>
          );
        })}
      </div>
    </section>
  );
}
