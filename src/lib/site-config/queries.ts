import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

const CONFIG_DEFAULTS: Record<string, boolean> = {
  orders_enabled: false,
  registration_enabled: true,
  promo_banner: false,
};

export async function getSiteConfig(key: string) {
  "use cache";
  cacheLife("max");
  cacheTag(`site-setting-${key}`);

  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);

  return result[0]?.value ?? CONFIG_DEFAULTS[key] ?? false;
}
