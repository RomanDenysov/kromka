import { createConsentify } from "@consentify/core";

export const consent = createConsentify({
  policy: {
    categories: ["analytics"] as const,
    identifier: "kromka-v1", // change when updating policy
  },
  cookie: {
    name: "kromka-consent",
    // biome-ignore lint/style/noMagicNumbers: we need to use magic numbers for the consent cookie max age
    maxAgeSec: 60 * 60 * 24 * 365, // 1 year
  },
});

export type ConsentCategory = "analytics";
