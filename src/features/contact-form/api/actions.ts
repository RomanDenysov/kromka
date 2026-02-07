"use server";

import { sendEmail } from "@/lib/email";
import { log } from "@/lib/logger";
import { supportRequestSchema } from "../schema";

type SubmitSupportRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSupportRequest(data: {
  name: string;
  email: string;
  rootCause: string;
  message: string;
  sourcePath?: string;
  sourceUrl?: string;
  sourceRef?: string;
  userAgent?: string;
  posthogId?: string;
}): Promise<SubmitSupportRequestResult> {
  try {
    // Validate input with zod
    const validationResult = supportRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError?.message ?? "Neplatné údaje" };
    }

    const validatedData = validationResult.data;

    // Send email to staff (critical - must succeed)
    try {
      await sendEmail.supportRequest({
        name: validatedData.name,
        email: validatedData.email,
        rootCause: validatedData.rootCause,
        message: validatedData.message,
        sourcePath: validatedData.sourcePath,
        sourceUrl: validatedData.sourceUrl,
        sourceRef: validatedData.sourceRef,
        userAgent: validatedData.userAgent,
        posthogId: validatedData.posthogId,
      });
    } catch {
      return {
        success: false,
        error: "Nastala chyba pri odosielaní správy. Skúste to prosím znova.",
      };
    }

    // Send confirmation email to user (non-critical - failure doesn't affect success)
    try {
      await sendEmail.supportConfirmation({
        email: validatedData.email,
      });
    } catch (err) {
      log.email.warn({ err }, "Failed to send support confirmation email");
    }

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error: "Nastala chyba pri odosielaní správy. Skúste to prosím znova.",
    };
  }
}
