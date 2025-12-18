import {
  type ConsentState as BaseConsentState,
  createConsentify,
} from "@consentify/core";

export const consent = createConsentify({
  policy: {
    categories: ["analytics"] as const,
    identifier: "kromka-v1", // change when updating policy
  },
  cookie: {
    name: "kromka-consent",
    maxAgeSec: 60 * 60 * 24 * 365, // 1 year
  },
});

export type ConsentState = BaseConsentState<"analytics">;
