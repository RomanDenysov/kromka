"use server";

import { sendEmail } from "@/lib/email";
import { log } from "@/lib/logger";
import { b2bRequestSchema } from "../schema";

type SubmitB2BRequestResult =
  | { success: true }
  | { success: false; error: string };

export async function submitB2BRequest(data: {
  companyName: string;
  businessType: string;
  userName: string;
  email: string;
  phone: string;
}): Promise<SubmitB2BRequestResult> {
  try {
    // Validate input with zod
    const validationResult = b2bRequestSchema.safeParse(data);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return { success: false, error: firstError?.message ?? "Neplatné údaje" };
    }

    const validatedData = validationResult.data;

    // Send email to staff
    await sendEmail.b2bRequest({
      companyName: validatedData.companyName,
      businessType: validatedData.businessType,
      userName: validatedData.userName,
      email: validatedData.email,
      phone: validatedData.phone,
    });

    return { success: true };
  } catch (error) {
    log.b2b.error({ err: error }, "B2B request submission failed");
    return {
      success: false,
      error: "Nastala chyba pri odosielaní žiadosti. Skúste to prosím znova.",
    };
  }
}
