import {
  Bean,
  CircleDot,
  Egg,
  Fish,
  FlaskConical,
  Flower2,
  Leaf,
  type LucideIcon,
  Milk,
  Nut,
  Shell,
  Sprout,
  TreePine,
  Wheat,
} from "lucide-react";
import type { AllergenCode } from "../schema";

/**
 * Lucide icons mapped to each EU 14 allergen code. Not all icons are
 * perfect food-allergen glyphs (sulphites, sesame, mollusc) but they
 * cover well enough for a v1 chip strip. Swap to custom SVGs later if
 * branding wants something more bakery-specific.
 */
export const ALLERGEN_ICONS: Record<AllergenCode, LucideIcon> = {
  gluten: Wheat,
  crustaceans: Shell,
  eggs: Egg,
  fish: Fish,
  peanuts: Nut,
  soybeans: Sprout,
  milk: Milk,
  tree_nuts: TreePine,
  celery: Leaf,
  mustard: Flower2,
  sesame: CircleDot,
  sulphites: FlaskConical,
  lupin: Bean,
  molluscs: Shell,
};
