import z from "zod";

const MAX_SOURCE_PATH_LENGTH = 500;
const MAX_SOURCE_URL_LENGTH = 1000;
const MAX_SOURCE_REF_LENGTH = 100;
const MAX_USER_AGENT_LENGTH = 500;
const MAX_POSTHOG_ID_LENGTH = 200;

export const supportRequestSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné"),
  email: z.string().trim().email("Neplatná emailová adresa"),
  rootCause: z.string().trim().min(1, "Príčina problému je povinná"),
  message: z.string().trim().min(1, "Správa je povinná"),
  // Optional context fields
  sourcePath: z
    .string()
    .trim()
    .max(MAX_SOURCE_PATH_LENGTH)
    .optional()
    .or(z.undefined()),
  sourceUrl: z
    .string()
    .trim()
    .max(MAX_SOURCE_URL_LENGTH)
    .optional()
    .or(z.undefined()),
  sourceRef: z
    .string()
    .trim()
    .max(MAX_SOURCE_REF_LENGTH)
    .optional()
    .or(z.undefined()),
  userAgent: z
    .string()
    .trim()
    .max(MAX_USER_AGENT_LENGTH)
    .optional()
    .or(z.undefined()),
  posthogId: z
    .string()
    .trim()
    .max(MAX_POSTHOG_ID_LENGTH)
    .optional()
    .or(z.undefined()),
});

export type SupportRequestSchema = z.infer<typeof supportRequestSchema>;
