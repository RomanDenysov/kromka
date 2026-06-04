import { authAllowedHosts } from "@/config";
import { env } from "@/env";

const isDev = process.env.NODE_ENV === "development";

export const emails = {
  support: "support@kavejo.sk",
  manager: "kromka@kavejo.sk",
  developer: env.DEVELOPER_EMAIL,
  from: env.EMAIL_USER,
} as const;

export const smtp = {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: true as const,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
};

/** Inboxes that receive order/B2B staff notifications. */
export function getStaffNotificationRecipients(): string[] {
  return isDev ? [emails.developer] : [emails.manager, emails.developer];
}

/** Inbox for `/kontakt/podpora` form submissions. */
export function getSupportFormRecipient(): string {
  return isDev ? emails.developer : emails.support;
}

function parseExtraAuthHosts(): string[] {
  const raw = process.env.AUTH_EXTRA_ALLOWED_HOSTS;
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
}

export function getAuthAllowedHosts(): string[] {
  return [...authAllowedHosts, ...parseExtraAuthHosts()];
}

/** Production custom domain only — not Vercel preview (`VERCEL_ENV=preview`). */
export function isProductionCustomDomainDeployment(): boolean {
  if (process.env.VERCEL_ENV === "preview") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return true;
  }
  return process.env.NODE_ENV === "production";
}

export function getAuthBaseUrlConfig() {
  return {
    allowedHosts: getAuthAllowedHosts(),
    fallback: env.BETTER_AUTH_URL,
  } as const;
}
