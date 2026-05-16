import type { AllergenCode } from "@/features/allergens/schema";

/**
 * Heuristic keyword-to-allergen mapping used to surface "Navrhnuté"
 * chips under the ingredient name field. Cosmetic; admin always confirms.
 */
const RULES: Array<{ pattern: RegExp; codes: AllergenCode[] }> = [
  { pattern: /múk[au]|chleb|otrub|pšenic|raž|spal|ovs/i, codes: ["gluten"] },
  {
    pattern:
      /mlieko|smotan|maslo|jogurt|syr|tvaroh|cmar|mascarpone|niva|tvarôžky/i,
    codes: ["milk"],
  },
  { pattern: /vajc/i, codes: ["eggs"] },
  {
    pattern: /mandl[ae]|orech|lieskov|kešu|piniov|para|pekan|pistaci/i,
    codes: ["tree_nuts"],
  },
  { pattern: /araši/i, codes: ["peanuts"] },
  { pattern: /sezam/i, codes: ["sesame"] },
  { pattern: /sója|sójov|sojov/i, codes: ["soybeans"] },
  { pattern: /horčic/i, codes: ["mustard"] },
  { pattern: /zeler/i, codes: ["celery"] },
  { pattern: /sušen[ée] (marhul|sliv|brusnic)/i, codes: ["sulphites"] },
];

export function suggestAllergens(name: string): AllergenCode[] {
  if (!name) {
    return [];
  }
  const out = new Set<AllergenCode>();
  for (const rule of RULES) {
    if (rule.pattern.test(name)) {
      for (const c of rule.codes) {
        out.add(c);
      }
    }
  }
  return [...out];
}
