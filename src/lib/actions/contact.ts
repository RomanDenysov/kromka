"use server";

import { supportRequestSchema } from "@/validation/contact";
import { sendEmail } from "../email";

type SubmitSupportRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function submitSupportRequest(data: {
  name: string;
  email: string;
  rootCause: string;
  message: string;
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
    } catch {
      // ignore
    }

    return { success: true };
  } catch (_error) {
    return {
      success: false,
      error: "Nastala chyba pri odosielaní správy. Skúste to prosím znova.",
    };
  }
}
