import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

type SiteConfigKey = "orders_enabled" | "registration_enabled" | "promo_banner";

const CONFIG_DEFAULTS: Record<SiteConfigKey, boolean> = {
  orders_enabled: false,
  registration_enabled: true,
  promo_banner: false,
};

export async function getSiteConfig(key: SiteConfigKey) {
  "use cache";
  cacheLife("max");
  cacheTag(`site-setting-${key}`);

  const setting = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.key, key),
  });

  return setting?.value ?? CONFIG_DEFAULTS[key];
}
