"use server";

import { refresh, updateTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getAuth } from "@/lib/auth/session";

export async function updateSiteConfig(
  key: string,
  value: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user } = await getAuth();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
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
