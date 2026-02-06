"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import {
  type UpdateOrganizationSchema,
  updateOrganizationSchema,
} from "@/validation/b2b";

type UpdateOrganizationResult =
  | { success: true }
  | { success: false; error: string };

async function ensurePriceTierExists(priceTierId: string) {
  const tier = await db.query.priceTiers.findFirst({
    where: (t, { eq: eqOp }) => eqOp(t.id, priceTierId),
    columns: { id: true },
  });
  return Boolean(tier);
}

function buildOrganizationUpdates(
  data: UpdateOrganizationSchema
): Partial<typeof organizations.$inferInsert> {
  const updates: Partial<typeof organizations.$inferInsert> = {};

  if (data.billingName !== undefined) {
    updates.billingName = data.billingName.length > 0 ? data.billingName : null;
  }
  if (data.ico !== undefined) {
    updates.ico = data.ico.length > 0 ? data.ico : null;
  }
  if (data.dic !== undefined) {
    updates.dic = data.dic || null;
  }
  if (data.icDph !== undefined) {
    updates.icDph = data.icDph || null;
  }
  if (data.billingEmail !== undefined) {
    updates.billingEmail =
      data.billingEmail.length > 0 ? data.billingEmail : null;
  }
  if (data.paymentTermDays !== undefined) {
    updates.paymentTermDays = data.paymentTermDays;
  }
  if (data.priceTierId !== undefined) {
    updates.priceTierId = data.priceTierId || null;
  }

  return updates;
}

export async function updateOrganization(
  data: unknown
): Promise<UpdateOrganizationResult> {
  try {
    await requireAdmin();

    const validationResult = updateOrganizationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Neplatné údaje",
      };
    }

    const validated = validationResult.data;

    if (validated.priceTierId && validated.priceTierId.length > 0) {
      const exists = await ensurePriceTierExists(validated.priceTierId);
      if (!exists) {
        return { success: false, error: "Cenová skupina nebola nájdená" };
      }
    }

    // Validate ico is non-empty if present
    if (validated.ico !== undefined && validated.ico.length === 0) {
      return { success: false, error: "IČO nemôže byť prázdne" };
    }

    const updates = buildOrganizationUpdates(validated);

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, validated.organizationId))
      .returning({ id: organizations.id });

    if (!updated) {
      return { success: false, error: "Organizácia nebola nájdená" };
    }

    updateTag("organizations");

    return { success: true };
  } catch (error) {
    console.error("[SERVER] Update organization failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri aktualizácii organizácie",
    };
  }
}
