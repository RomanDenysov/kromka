"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { ingredientPriceHistory, ingredients } from "@/db/schema";
import { draftSlug } from "@/db/utils";
import { requireIngredientEdit } from "@/lib/auth/guards";
import { log } from "@/lib/logger";
import {
  anthropic,
  extractJsonBlock,
  NUTRITION_SYSTEM_PROMPT,
} from "../lib/anthropic";
import {
  type AiNutritionSuggestion,
  aiNutritionSuggestionSchema,
  type IngredientSchema,
  ingredientSchema,
} from "../schema";
import { findSimilarIngredients } from "./queries";

type ActionResult<T = void> =
  | (T extends void ? { success: true } : { success: true } & T)
  | { success: false; error: string };

function invalidateIngredients(id?: string, priceChanged = false) {
  updateTag("ingredients");
  if (id) {
    updateTag(`ingredient-${id}`);
  }
  if (priceChanged) {
    if (id) {
      updateTag(`ingredient-${id}-prices`);
    }
    // Recipes' computed cost depends on ingredient prices; reports too.
    updateTag("recipes");
    updateTag("reports");
  }
}

/**
 * Create a new ingredient + initial price-history row. Returns the
 * created ingredient so the recipe builder's inline-create flow can
 * autofill the picker without a redirect.
 */
export async function createIngredientAction(
  data: IngredientSchema
): Promise<ActionResult<{ ingredient: { id: string; name: string } }>> {
  await requireIngredientEdit();
  const parsed = ingredientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  try {
    const [created] = await db
      .insert(ingredients)
      .values({
        name: v.name,
        slug: v.slug || draftSlug(v.name),
        baseUnit: v.baseUnit,
        gramsPerPiece: v.gramsPerPiece,
        pricePerKgCents: v.pricePerKgCents,
        pricePerPieceCents: v.pricePerPieceCents,
        supplierName: v.supplierName,
        allergenCodes: v.allergenCodes,
        nutritionPer100: v.nutritionPer100,
        nutritionSource: v.nutritionSource,
        notes: v.notes,
        isActive: v.isActive,
      })
      .returning({ id: ingredients.id, name: ingredients.name });

    // History row mirrors the new price. Append AFTER ingredient is created
    // so the FK is satisfied; insert failure here only means we lost the
    // initial history row, the ingredient itself remains usable.
    try {
      await db.insert(ingredientPriceHistory).values({
        ingredientId: created.id,
        pricePerKgCents: v.pricePerKgCents,
        pricePerPieceCents: v.pricePerPieceCents,
        supplierName: v.supplierName,
        source: v.nutritionSource === "seed" ? "seed" : "manual",
        notes: "Initial price",
      });
    } catch (err) {
      log.ingredients.warn(
        { err, ingredientId: created.id },
        "Initial price-history insert failed; ingredient created"
      );
    }

    invalidateIngredients(undefined, true);
    return { success: true, ingredient: created };
  } catch (err) {
    log.ingredients.error({ err }, "Create ingredient failed");
    return { success: false, error: "Vytvorenie zlyhalo" };
  }
}

/**
 * Update an ingredient. When the price changes, append a history row
 * BEFORE updating so a partial-failure scenario leaves the audit log
 * complete and the user retries (rather than silently losing a price
 * change).
 */
export async function updateIngredientAction({
  id,
  data,
}: {
  id: string;
  data: IngredientSchema;
}): Promise<ActionResult> {
  await requireIngredientEdit();
  const parsed = ingredientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Neplatné údaje" };
  }
  const v = parsed.data;

  const current = await db
    .select({
      pricePerKgCents: ingredients.pricePerKgCents,
      pricePerPieceCents: ingredients.pricePerPieceCents,
      supplierName: ingredients.supplierName,
    })
    .from(ingredients)
    .where(eq(ingredients.id, id))
    .limit(1);
  if (!current[0]) {
    return { success: false, error: "Surovina neexistuje" };
  }

  const priceChanged =
    current[0].pricePerKgCents !== v.pricePerKgCents ||
    current[0].pricePerPieceCents !== v.pricePerPieceCents ||
    current[0].supplierName !== v.supplierName;

  try {
    if (priceChanged) {
      await db.insert(ingredientPriceHistory).values({
        ingredientId: id,
        pricePerKgCents: v.pricePerKgCents,
        pricePerPieceCents: v.pricePerPieceCents,
        supplierName: v.supplierName,
        source: v.nutritionSource === "ai" ? "ai" : "manual",
      });
    }

    await db
      .update(ingredients)
      .set({
        name: v.name,
        slug: v.slug,
        baseUnit: v.baseUnit,
        gramsPerPiece: v.gramsPerPiece,
        pricePerKgCents: v.pricePerKgCents,
        pricePerPieceCents: v.pricePerPieceCents,
        supplierName: v.supplierName,
        allergenCodes: v.allergenCodes,
        nutritionPer100: v.nutritionPer100,
        nutritionSource: v.nutritionSource,
        notes: v.notes,
        isActive: v.isActive,
      })
      .where(eq(ingredients.id, id));

    invalidateIngredients(id, priceChanged);
    return { success: true };
  } catch (err) {
    log.ingredients.error(
      { err, ingredientId: id },
      "Update ingredient failed"
    );
    return { success: false, error: "Uloženie zlyhalo" };
  }
}

/**
 * Toggle the isActive flag. Soft-deactivation keeps the row but hides
 * it from new recipe picker selections.
 */
export async function setIngredientActiveAction({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  await requireIngredientEdit();
  try {
    await db
      .update(ingredients)
      .set({ isActive })
      .where(eq(ingredients.id, id));
    invalidateIngredients(id);
    return { success: true };
  } catch (err) {
    log.ingredients.error({ err, ingredientId: id }, "Toggle active failed");
    return { success: false, error: "Operácia zlyhala" };
  }
}

/**
 * Hard delete an ingredient. Blocked when any recipe items reference it
 * (Phase C check via raw SQL; no-op until Phase C ships recipe_items).
 */
export async function deleteIngredientAction({
  id,
}: {
  id: string;
}): Promise<ActionResult> {
  await requireIngredientEdit();
  try {
    // Defensive check: query recipe_items by ingredient_id if the table exists.
    // We do it via information_schema so this code keeps working both before
    // and after Phase C lands.
    const inUse = await db.execute(sql`
      WITH has_table AS (
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'recipe_items'
        ) AS exists
      )
      SELECT CASE
        WHEN (SELECT exists FROM has_table) IS NOT TRUE THEN false
        ELSE EXISTS (
          SELECT 1 FROM recipe_items WHERE ingredient_id = ${id}
        )
      END AS in_use
    `);
    const inUseRow = inUse.rows[0] as { in_use: boolean } | undefined;
    if (inUseRow?.in_use) {
      return {
        success: false,
        error: "Surovina je použitá v receptoch a nemôže byť odstránená.",
      };
    }

    await db.delete(ingredients).where(eq(ingredients.id, id));
    invalidateIngredients(id);
    return { success: true };
  } catch (err) {
    log.ingredients.error(
      { err, ingredientId: id },
      "Delete ingredient failed"
    );
    return { success: false, error: "Odstránenie zlyhalo" };
  }
}

/**
 * Read-only AI nutrition suggestion. The admin reviews the suggestion
 * in a dialog and then persists via updateIngredientAction with
 * nutritionSource: 'ai'. This action never writes to the DB.
 */
export async function aiAutofillNutritionAction({
  ingredientId,
}: {
  ingredientId: string;
}): Promise<ActionResult<{ suggestion: AiNutritionSuggestion }>> {
  await requireIngredientEdit();

  if (!anthropic) {
    return {
      success: false,
      error: "AI funkcia nie je nakonfigurované (chýba ANTHROPIC_API_KEY)",
    };
  }

  const row = await db
    .select({
      name: ingredients.name,
      supplierName: ingredients.supplierName,
      baseUnit: ingredients.baseUnit,
      gramsPerPiece: ingredients.gramsPerPiece,
    })
    .from(ingredients)
    .where(eq(ingredients.id, ingredientId))
    .limit(1);
  if (!row[0]) {
    return { success: false, error: "Surovina neexistuje" };
  }

  const i = row[0];
  const userContent = `Surovina: ${i.name}${i.supplierName ? ` (${i.supplierName})` : ""}
Jednotka: ${i.baseUnit === "g" ? "100 g" : `1 kus = ${i.gramsPerPiece ?? "?"} g, hodnoty na 100 g`}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: NUTRITION_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userContent }],
    });

    const text =
      message.content[0]?.type === "text" ? message.content[0].text : "";
    if (!text) {
      return { success: false, error: "AI nevrátila odpoveď" };
    }

    let json: unknown;
    try {
      json = JSON.parse(extractJsonBlock(text));
    } catch (err) {
      log.ingredients.error(
        { err, ingredientId, raw: text },
        "AI returned non-JSON"
      );
      return { success: false, error: "AI vrátila nesprávny formát" };
    }

    const parsed = aiNutritionSuggestionSchema.safeParse(json);
    if (!parsed.success) {
      log.ingredients.error(
        { ingredientId, raw: text, issues: parsed.error.issues },
        "AI response failed schema validation"
      );
      return { success: false, error: "AI vrátila neplatné hodnoty" };
    }

    return { success: true, suggestion: parsed.data };
  } catch (err) {
    log.ingredients.error({ err, ingredientId }, "AI autofill call failed");
    return { success: false, error: "AI volanie zlyhalo" };
  }
}

/**
 * Create a draft ingredient with the minimal CHECK-satisfying defaults
 * and redirect to its edit page. Used by the "Nová surovina" button.
 */
export async function createDraftIngredientAction() {
  await requireIngredientEdit();

  const [created] = await db
    .insert(ingredients)
    .values({
      // baseUnit defaults to 'g' via schema; pair it with cents/kg = 0 so
      // the XOR CHECK is satisfied. Admin enters a real price next.
      pricePerKgCents: 0,
    })
    .returning({ id: ingredients.id });

  try {
    await db.insert(ingredientPriceHistory).values({
      ingredientId: created.id,
      pricePerKgCents: 0,
      source: "manual",
      notes: "Initial draft",
    });
  } catch (err) {
    log.ingredients.warn(
      { err, ingredientId: created.id },
      "Draft price-history insert failed"
    );
  }

  updateTag("ingredients");
  redirect(`/admin/ingredients/${created.id}`);
}

/**
 * Server-action wrapper around findSimilarIngredients for client-side
 * use from the duplicate-suggestion component.
 */
export async function findSimilarIngredientsAction(name: string) {
  await requireIngredientEdit();
  if (!name || name.trim().length < 2) {
    return [];
  }
  return findSimilarIngredients(name);
}
