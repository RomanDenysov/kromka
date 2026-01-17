"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import type { Address } from "@/db/types";
import { requireAdmin } from "@/lib/auth/guards";

type UpdateOrganizationResult =
  | { success: true }
  | { success: false; error: string };

export async function updateOrganization({
  organizationId,
  billingName,
  ico,
  dic,
  icDph,
  billingAddress,
  billingEmail,
  paymentTermDays,
  priceTierId,
}: {
  organizationId: string;
  billingName?: string;
  ico?: string;
  dic?: string;
  icDph?: string;
  billingAddress?: Address;
  billingEmail?: string;
  paymentTermDays?: number;
  priceTierId?: string;
}): Promise<UpdateOrganizationResult> {
  try {
    await requireAdmin();

    // Validate price tier if provided
    if (priceTierId) {
      const tier = await db.query.priceTiers.findFirst({
        where: (tier, { eq: eqOp }) => eqOp(tier.id, priceTierId),
        columns: { id: true },
      });

      if (!tier) {
        return { success: false, error: "Cenová skupina nebola nájdená" };
      }
    }

    const updates: Partial<typeof organizations.$inferInsert> = {};

    if (billingName !== undefined) {
      updates.billingName = billingName;
    }
    if (ico !== undefined) {
      updates.ico = ico;
    }
    if (dic !== undefined) {
      updates.dic = dic || null;
    }
    if (icDph !== undefined) {
      updates.icDph = icDph || null;
    }
    if (billingAddress !== undefined) {
      updates.billingAddress = billingAddress || null;
    }
    if (billingEmail !== undefined) {
      updates.billingEmail = billingEmail;
    }
    if (paymentTermDays !== undefined) {
      updates.paymentTermDays = paymentTermDays;
    }
    if (priceTierId !== undefined) {
      updates.priceTierId = priceTierId || null;
    }

    await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, organizationId));

    return { success: true };
  } catch (error) {
    console.error("[SERVER] Update organization failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri aktualizácii organizácie",
    };
  }
}
