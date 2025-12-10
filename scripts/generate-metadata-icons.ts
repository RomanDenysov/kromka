/** biome-ignore-all lint/style/noMagicNumbers: metadata icons sizes */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const generateMetadataIcons = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sizes = [16, 32, 48, 72, 96, 144, 168, 192, 512];
  const inputFile = path.join(__dirname, "../public/icon.png");
  const outputDir = path.join(__dirname, "../public/icons");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(inputFile).resize(size, size).toFile(outputPath);

    console.log(`Generated ${size}x${size} icon`);
  }

  console.log("Done");
};

generateMetadataIcons();
