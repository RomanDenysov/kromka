"use server";

import { addDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { b2bApplications, invitations, organizations } from "@/db/schema";
import { DEFAULT_PAYMENT_TERM_DAYS } from "@/db/types";
import { requireAdmin } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
import { getSlug } from "@/lib/get-slug";
import { createId } from "@/lib/ids";
import {
  approveB2bApplicationSchema,
  b2bApplicationSchema,
  rejectB2bApplicationSchema,
} from "@/validation/b2b";
import { getB2bApplicationById } from "./queries";

type SubmitB2bApplicationResult =
  | { success: true }
  | { success: false; error: string };

export async function submitB2bApplication(
  data: unknown
): Promise<SubmitB2bApplicationResult> {
  try {
    // Validate input with zod
    const validationResult = b2bApplicationSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Neplatné údaje",
      };
    }

    const validatedData = validationResult.data;

    // Insert into database
    const [application] = await db
      .insert(b2bApplications)
      .values({
        companyName: validatedData.companyName,
        ico: validatedData.ico,
        dic: validatedData.dic || null,
        icDph: validatedData.icDph || null,
        contactName: validatedData.contactName,
        contactEmail: validatedData.contactEmail,
        contactPhone: validatedData.contactPhone,
        billingAddress: validatedData.billingAddress || null,
        message: validatedData.message || null,
        status: "pending",
      })
      .returning();

    // Send email to staff
    await sendEmail.b2bApplication({
      applicationId: application.id,
      companyName: validatedData.companyName,
      ico: validatedData.ico,
      dic: validatedData.dic,
      icDph: validatedData.icDph,
      contactName: validatedData.contactName,
      contactEmail: validatedData.contactEmail,
      contactPhone: validatedData.contactPhone,
      billingAddress: validatedData.billingAddress,
      message: validatedData.message,
    });

    return { success: true };
  } catch (error) {
    console.error("[SERVER] Submit B2B application failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri odosielaní žiadosti. Skúste to prosím znova.",
    };
  }
}

type ApproveB2bApplicationResult =
  | { success: true; organizationId: string }
  | { success: false; error: string };

export async function approveB2bApplication(
  data: unknown
): Promise<ApproveB2bApplicationResult> {
  try {
    const admin = await requireAdmin();

    const validationResult = approveB2bApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Neplatné údaje",
      };
    }

    const { applicationId, priceTierId } = validationResult.data;

    const application = await getB2bApplicationById(applicationId);

    if (!application) {
      return { success: false, error: "Žiadosť nebola nájdená" };
    }

    // Validate price tier exists
    const priceTier = await db.query.priceTiers.findFirst({
      where: (tier, { eq: eqOp }) => eqOp(tier.id, priceTierId),
      columns: { id: true },
    });

    if (!priceTier) {
      return { success: false, error: "Cenová skupina nebola nájdená" };
    }

    // Atomic claim: update status FIRST with WHERE status = 'pending'
    const [claimed] = await db
      .update(b2bApplications)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
      })
      .where(
        and(
          eq(b2bApplications.id, applicationId),
          eq(b2bApplications.status, "pending")
        )
      )
      .returning({ id: b2bApplications.id });

    if (!claimed) {
      return {
        success: false,
        error: "Žiadosť už bola spracovaná",
      };
    }

    // Create organization slug from company name
    const baseSlug = getSlug(application.companyName);
    let orgSlug = baseSlug;
    let slugCounter = 1;

    // Ensure unique slug
    while (
      await db.query.organizations.findFirst({
        where: (org, { eq: eqOp }) => eqOp(org.slug, orgSlug),
        columns: { id: true },
      })
    ) {
      orgSlug = `${baseSlug}-${slugCounter}`;
      slugCounter += 1;
    }

    // Create organization
    const [organization] = await db
      .insert(organizations)
      .values({
        id: createId(),
        name: application.companyName,
        slug: orgSlug,
        billingName: application.companyName,
        ico: application.ico,
        dic: application.dic || null,
        icDph: application.icDph || null,
        billingAddress: application.billingAddress || null,
        billingEmail: application.contactEmail,
        paymentTermDays: DEFAULT_PAYMENT_TERM_DAYS,
        priceTierId,
        createdAt: new Date(),
      })
      .returning();

    // Create invitation
    const expiresAt = addDays(new Date(), 7);
    await db.insert(invitations).values({
      id: createId(),
      organizationId: organization.id,
      email: application.contactEmail,
      role: "member",
      status: "pending",
      expiresAt,
      inviterId: admin.id,
    });

    updateTag("b2b-applications");

    // TODO: Send approval email with invitation link

    return {
      success: true,
      organizationId: organization.id,
    };
  } catch (error) {
    console.error("[SERVER] Approve B2B application failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri schvaľovaní žiadosti",
    };
  }
}

type RejectB2bApplicationResult =
  | { success: true }
  | { success: false; error: string };

export async function rejectB2bApplication(
  data: unknown
): Promise<RejectB2bApplicationResult> {
  try {
    const admin = await requireAdmin();

    const validationResult = rejectB2bApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Neplatné údaje",
      };
    }

    const { applicationId, rejectionReason } = validationResult.data;

    // Atomic claim: update with WHERE status = 'pending'
    const [claimed] = await db
      .update(b2bApplications)
      .set({
        status: "rejected",
        rejectionReason,
        reviewedAt: new Date(),
        reviewedBy: admin.id,
      })
      .where(
        and(
          eq(b2bApplications.id, applicationId),
          eq(b2bApplications.status, "pending")
        )
      )
      .returning({ id: b2bApplications.id });

    if (!claimed) {
      return {
        success: false,
        error: "Žiadosť nebola nájdená alebo už bola spracovaná",
      };
    }

    updateTag("b2b-applications");

    // TODO: Send rejection email

    return { success: true };
  } catch (error) {
    console.error("[SERVER] Reject B2B application failed:", error);
    return {
      success: false,
      error: "Nastala chyba pri zamietnutí žiadosti",
    };
  }
}
