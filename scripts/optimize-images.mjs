/** biome-ignore-all lint/style/noMagicNumbers: image optimization constants */
import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const imagesDir = "public/images";

const imagesToOptimize = [
  {
    name: "breads-1.jpg",
    maxWidth: 1920,
    quality: 80,
  },
  {
    name: "stores.jpg",
    maxWidth: 1920,
    quality: 80,
  },
  {
    name: "kromka-vianoce-hero-min.jpeg",
    maxWidth: 1920,
    quality: 80,
  },
];

async function optimizeImage(config) {
  const inputPath = join(imagesDir, config.name);
  const backupPath = join(imagesDir, `${config.name}.original`);
  const outputPath = join(
    imagesDir,
    // biome-ignore lint/performance/useTopLevelRegex: regex is not defined in the top level scope
    config.name.replace(/\.(jpg|jpeg)$/i, ".webp")
  );

  console.log(`\nOptimizing ${config.name}...`);

  // Backup original if not already backed up
  if (existsSync(inputPath) && !existsSync(backupPath)) {
    console.log(`  Backing up to ${config.name}.original`);
    renameSync(inputPath, backupPath);
  }

  // Get image info
  const info = await sharp(backupPath).metadata();
  console.log(
    `  Original: ${info.width}x${info.height}, ${(info.size / 1024 / 1024).toFixed(2)}MB`
  );

  // Optimize and convert to WebP
  await sharp(backupPath)
    .resize(config.maxWidth, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality })
    .toFile(outputPath);

  const newInfo = await sharp(outputPath).metadata();
  const newSizeKB = (newInfo.size / 1024).toFixed(2);
  console.log(
    `  Optimized: ${newInfo.width}x${newInfo.height}, ${newSizeKB}KB`
  );
  console.log(
    `  Saved: ${((info.size - newInfo.size) / 1024 / 1024).toFixed(2)}MB`
  );
  console.log(`  Output: ${outputPath}`);
}

async function main() {
  console.log("Starting image optimization...\n");

  for (const config of imagesToOptimize) {
    try {
      await optimizeImage(config);
    } catch (error) {
      console.error(`  Error optimizing ${config.name}:`, error.message);
    }
  }

  console.log("\n✅ Image optimization complete!");
  console.log("\nNext steps:");
  console.log("1. Update image references to use .webp extensions");
  console.log("2. Test the site to ensure images load correctly");
  console.log("3. Deploy and monitor the bandwidth reduction");
}

main().catch(console.error);
