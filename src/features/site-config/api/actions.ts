"use server";

import { refresh, updateTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

const ALLOWED_CONFIG_KEYS = [
  "orders_enabled",
  "registration_enabled",
  "promo_banner",
] as const;
type ConfigKey = (typeof ALLOWED_CONFIG_KEYS)[number];

export async function updateSiteConfig(
  key: ConfigKey,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (!ALLOWED_CONFIG_KEYS.includes(key)) {
    return { success: false, error: "Invalid config key" };
  }

  await db
    .insert(siteSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: [siteSettings.key],
      set: { value },
    });

  updateTag(`site-setting-${key}`);
  refresh();

  return { success: true };
}
