import Anthropic from "@anthropic-ai/sdk";

/**
 * Singleton Anthropic client. Returns null when ANTHROPIC_API_KEY is
 * missing so the AI autofill action can fail gracefully without
 * crashing import-time.
 */
export const anthropic: Anthropic | null = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export const NUTRITION_SYSTEM_PROMPT = `Si nutričný odborník pre slovenskú pekáreň. Pre danú surovinu vráť presné nutričné hodnoty na 100 g vo formáte JSON.

Hodnoty musia byť v základnej forme (suchá múka, surové vajce, atď.).
Použi oficiálne zdroje: USDA FoodData Central, slovenské tabuľky zloženia potravín.
Ak si nie si istý hodnotou, vráť 0 a "confidence": "low".

Vráť výhradne JSON v presnom formáte (bez markdown bloku, bez komentárov):
{
  "kcal": number,
  "protein": number,
  "fat": number,
  "saturatedFat": number,
  "carbs": number,
  "sugar": number,
  "salt": number,
  "fiber": number,
  "confidence": "high" | "medium" | "low",
  "source": string
}`;

const JSON_FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/;

/**
 * Strip optional ```json fences and parse. The system prompt asks for
 * raw JSON, but some Claude responses still wrap in fences.
 */
export function extractJsonBlock(raw: string): string {
  const fenced = raw.match(JSON_FENCE_RE);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return raw.trim();
}
