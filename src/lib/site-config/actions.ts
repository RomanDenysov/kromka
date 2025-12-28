"use server";

import { refresh, updateTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "../auth/guards";

export async function updateSiteConfig(
  key: string,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

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
