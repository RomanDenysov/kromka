/**
 * Migration script: productImages table → products.imageId
 *
 * Takes the first image (sortOrder=0) from productImages
 * and sets it as the imageId on the products table.
 *
 * Run with:
 *   npx tsx scripts/migrate-product-images.ts        # dev (default)
 *   npx tsx scripts/migrate-product-images.ts prod   # production
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: we need to import the schema
import * as schema from "../src/db/schema";
import { products } from "../src/db/schema";

// Parse environment argument
const env = process.argv[2] || "dev";
const envFile = env === "prod" ? ".env.production" : ".env";

console.log(`🔧 Loading environment from: ${envFile}\n`);
config({ path: envFile });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

// Create database connection for the specified environment
const sql = neon(databaseUrl);
const db = drizzle({ client: sql, schema });

// Safety confirmation for production
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
      "⚠️  You are about to run migration on PRODUCTION. Type 'yes' to confirm: ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

async function migrateProductImages() {
  // Confirm before running on production
  const confirmed = await confirmProduction();
  if (!confirmed) {
    console.log("❌ Migration cancelled");
    process.exit(0);
  }

  console.log(
    `🚀 Starting product images migration (${env.toUpperCase()})...\n`
  );

  // Get all products with their images (sorted by sortOrder)
  const productsWithImages = await db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      imageId: true,
    },
    with: {
      images: {
        with: { media: true },
        orderBy: (image, { asc }) => [asc(image.sortOrder)],
      },
    },
  });

  console.log(`📦 Found ${productsWithImages.length} products to process\n`);

  let updated = 0;
  let skipped = 0;
  let noImages = 0;

  for (const product of productsWithImages) {
    // Skip if imageId is already set
    if (product.imageId) {
      console.log(`⏭️  [${product.name}] Already has imageId, skipping`);
      skipped += 1;
      continue;
    }

    // Get first image
    const firstImage = product.images[0];

    if (!firstImage) {
      console.log(`⚠️  [${product.name}] No images found`);
      noImages += 1;
      continue;
    }

    // Update product with imageId
    await db
      .update(products)
      .set({ imageId: firstImage.mediaId })
      .where(eq(products.id, product.id));

    console.log(
      `✅ [${product.name}] Set imageId to ${firstImage.mediaId} (${firstImage.media.name})`
    );
    updated += 1;
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped (already set): ${skipped}`);
  console.log(`   ⚠️  No images: ${noImages}`);
  console.log(`   📦 Total: ${productsWithImages.length}`);

  // Optional: Show products that had multiple images (will lose secondary images)
  const productsWithMultipleImages = productsWithImages.filter(
    (p) => p.images.length > 1
  );

  if (productsWithMultipleImages.length > 0) {
    console.log(
      "\n⚠️  Products with multiple images (secondary images will be orphaned):"
    );
    for (const p of productsWithMultipleImages) {
      console.log(`   - ${p.name}: ${p.images.length} images`);
    }
  }

  console.log("\n✨ Migration complete!");
  console.log("\n📋 Next steps:");
  console.log("   1. Verify all products display images correctly");
  console.log("   2. Test admin product form (upload/change image)");
  console.log("   3. After 1 week verification, drop productImages table:");
  console.log("      - Remove table from src/db/schema.ts");
  console.log("      - Remove productImagesRelations");
  console.log("      - Update mediaRelations (remove productImages)");
  console.log(
    "      - Run: npx drizzle-kit generate && npx drizzle-kit migrate"
  );
}

migrateProductImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
