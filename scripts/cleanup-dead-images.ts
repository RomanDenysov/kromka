import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
// biome-ignore lint/performance/noNamespaceImport: TODO: fix this in a future
import * as schema from "@/db/schema";
import { media } from "@/db/schema";

dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL ?? "");
const dbClient = drizzle({ client: sql, schema });

async function cleanupDeadImages() {
  const allMedia = await dbClient.query.media.findMany();

  for (const item of allMedia) {
    try {
      const res = await fetch(item.url, { method: "HEAD" });
      // biome-ignore lint/style/noMagicNumbers: TODO: fix this in a future
      if (res.status === 404) {
        console.log(`Deleting dead media: ${item.url}`);
        await dbClient.delete(media).where(eq(media.id, item.id));
      }
    } catch (_e) {
      console.log(`Failed to check: ${item.url}`);
    }
  }
}

cleanupDeadImages();
