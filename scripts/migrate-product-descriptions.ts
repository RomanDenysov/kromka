/**
 * Migration script: products.description (jsonb Tiptap) → products.description_text (plain text)
 *
 * For each product:
 *   1. Read the legacy `description` JSONB column.
 *   2. Flatten to plain text via Tiptap's generateText (block nodes joined with \n\n).
 *   3. Best-effort regex extract a weight token (e.g. "750g", "1,2 kg", "6 ks");
 *      normalise kg→g, l→ml; strip the token from the text. If no match, leave
 *      weight_value/weight_unit NULL - admin backfills via the form.
 *   4. Write to `description_text`, `weight_value`, `weight_unit`.
 *
 * Idempotent: skips rows where `description_text` is already set.
 *
 * Run with:
 *   pnpm dlx tsx scripts/migrate-product-descriptions.ts        # dev (default)
 *   pnpm dlx tsx scripts/migrate-product-descriptions.ts prod   # production
 */

import { neon } from "@neondatabase/serverless";
import type { JSONContent } from "@tiptap/react";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: we need to import the schema
import * as schema from "../src/db/schema";
import { products } from "../src/db/schema";
import type { WeightUnit } from "../src/db/types";
import { jsonContentToText } from "../src/lib/editor-utils";

const env = process.argv[2] || "dev";
const envFile = env === "prod" ? ".env.production" : ".env";

console.log(`🔧 Loading environment from: ${envFile}\n`);
config({ path: envFile });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle({ client: sql, schema });

async function confirmProduction(): Promise<boolean> {
  if (env !== "prod") {
    return true;
  }
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(
      "⚠️  Running on PRODUCTION. Type 'yes' to confirm: ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

/**
 * Flatten a Tiptap JSONContent doc into plain text, joining top-level block
 * nodes (paragraphs, headings, list items) with a blank line so paragraph
 * structure survives. Falls back to jsonContentToText for safety.
 */
function flattenToText(content: JSONContent | null): string {
  if (!content) {
    return "";
  }
  const blocks = Array.isArray(content.content) ? content.content : [];
  if (blocks.length === 0) {
    return jsonContentToText(content).trim();
  }
  const parts = blocks.map((block) =>
    jsonContentToText({ type: "doc", content: [block] }).trim()
  );
  return parts.filter(Boolean).join("\n\n").trim();
}

const WEIGHT_REGEX = /(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|ks)\b/i;
const LEADING_SEPARATOR_REGEX = /^\s*[|\-–—]\s*/;
const TRAILING_SEPARATOR_REGEX = /\s*[|\-–—]\s*$/;
const MULTI_NEWLINE_REGEX = /\n{3,}/g;

/**
 * Best-effort weight extraction. Returns { value, unit, stripped } where
 * stripped is the input text minus the matched token (and a trailing pipe/dash
 * separator if present). Returns null match if nothing found.
 */
function extractWeight(text: string): {
  value: number | null;
  unit: WeightUnit | null;
  stripped: string;
} {
  const match = text.match(WEIGHT_REGEX);
  if (!match) {
    return { value: null, unit: null, stripped: text };
  }
  const rawValue = Number.parseFloat(match[1].replace(",", "."));
  const rawUnit = match[2].toLowerCase();

  let value: number;
  let unit: WeightUnit;
  if (rawUnit === "kg") {
    value = Math.round(rawValue * 1000);
    unit = "g";
  } else if (rawUnit === "l") {
    value = Math.round(rawValue * 1000);
    unit = "ml";
  } else {
    value = Math.round(rawValue);
    unit = rawUnit as WeightUnit;
  }

  // Strip the token plus an immediately following separator (" | " or " - ").
  const stripped = text
    .replace(WEIGHT_REGEX, "")
    .replace(LEADING_SEPARATOR_REGEX, "")
    .replace(TRAILING_SEPARATOR_REGEX, "")
    .replace(MULTI_NEWLINE_REGEX, "\n\n")
    .trim();

  return { value, unit, stripped };
}

async function migrate() {
  const confirmed = await confirmProduction();
  if (!confirmed) {
    console.log("❌ Migration cancelled");
    process.exit(0);
  }

  console.log(`🚀 Migrating product descriptions (${env.toUpperCase()})...\n`);

  // Pull every product. Use the legacy alias to read the jsonb column.
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      descriptionLegacy: products.descriptionLegacy,
    })
    .from(products);

  console.log(`📦 Found ${rows.length} products\n`);

  let updated = 0;
  let skipped = 0;
  let empty = 0;
  let weightExtracted = 0;

  for (const row of rows) {
    if (row.description !== null && row.description !== undefined) {
      console.log(`⏭️  [${row.name}] description_text already set, skipping`);
      skipped += 1;
      continue;
    }

    const legacy = row.descriptionLegacy as JSONContent | null;
    const flat = flattenToText(legacy);

    if (!flat) {
      // Write empty string so re-runs see it as populated.
      await db
        .update(products)
        .set({ description: "" })
        .where(eq(products.id, row.id));
      console.log(`⚪ [${row.name}] empty description`);
      empty += 1;
      continue;
    }

    const { value, unit, stripped } = extractWeight(flat);

    await db
      .update(products)
      .set({
        description: stripped,
        weightValue: value,
        weightUnit: unit,
      })
      .where(eq(products.id, row.id));

    if (value !== null && unit !== null) {
      weightExtracted += 1;
      console.log(`✅ [${row.name}] migrated (weight: ${value}${unit})`);
    } else {
      console.log(`✅ [${row.name}] migrated (no weight token)`);
    }
    updated += 1;
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Updated:           ${updated}`);
  console.log(`   ⚖️  Weight extracted:  ${weightExtracted}`);
  console.log(`   ⚪ Empty (no source): ${empty}`);
  console.log(`   ⏭️  Skipped (already): ${skipped}`);
  console.log(`   📦 Total:              ${rows.length}`);

  console.log("\n✨ Done. Next steps:");
  console.log("   1. Spot-check 10 rows in Drizzle Studio");
  console.log("   2. Backfill any missing weights in the admin UI");
  console.log(
    "   3. After the deprecation window, write a follow-up migration to"
  );
  console.log("      DROP the legacy `description` (jsonb) column and RENAME");
  console.log(
    "      `description_text` -> `description`. Update src/db/schema.ts:"
  );
  console.log("      remove `descriptionLegacy` and switch the field to");
  console.log('      `description: text("description")`.');
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
