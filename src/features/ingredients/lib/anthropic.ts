/**
 * AI nutrition autofill config. Uses the Vercel AI SDK with the
 * @ai-sdk/anthropic provider. The provider reads ANTHROPIC_API_KEY from
 * env automatically; callers should check isAiNutritionConfigured() and
 * skip the call (with a user-friendly error) when missing.
 */
export const NUTRITION_MODEL_ID = "claude-sonnet-4-5";

export const NUTRITION_SYSTEM_PROMPT = `Si nutričný odborník pre slovenskú pekáreň. Pre danú surovinu vráť presné nutričné hodnoty na 100 g.

Hodnoty musia byť v základnej forme (suchá múka, surové vajce, atď.).
Použi oficiálne zdroje: USDA FoodData Central, slovenské tabuľky zloženia potravín.
Ak si nie si istý hodnotou, vráť 0 a confidence="low".`;

export function isAiNutritionConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
