/**
 * App-wide constants (client-safe).
 * Env-derived values live in `@/config.server`.
 */

/** Legal entity details for policies and invoices. */
export const companyLegal = {
  name: "KROMKA s.r.o.",
  ico: "46 670 068",
  address: "ul. 17. novembra 8288/106, Prešov 080 01",
  court: "Okresný súd Prešov, Oddiel: Sro, Vložka číslo: 26041/P",
} as const;

/**
 * Email shown on the public site (footer, policies, JSON-LD).
 * Keep `MANAGER_EMAIL` in `.env` aligned with this value.
 */
export const publicContactEmail = "kromka@kavejo.sk" as const;

/** @deprecated Prefer `company` — kept for existing imports. */
export const COMPANY_INFO = {
  ...companyLegal,
  email: publicContactEmail,
} as const;

export const company = COMPANY_INFO;

export const site = {
  name: "Pekáreň Kromka",
  /** Canonical production URL (metadata, JSON-LD fallbacks). */
  productionUrl: "https://www.pekarenkromka.sk",
} as const;

export const contactPhones = [
  { label: "Prešov", phone: "+421908889550" },
  { label: "Košice: Kuzmányho", phone: "+421907993881" },
  { label: "Košice: Masarykova", phone: "+421919085558" },
] as const;

/**
 * Hostnames for Better Auth (magic link, OAuth, CSRF).
 * @see https://www.better-auth.com/docs/guides/dynamic-base-url
 */
export const authAllowedHosts = [
  "pekarenkromka.sk",
  "www.pekarenkromka.sk",
  "shop.pekarenkromka.sk",
  "kromka.vercel.app",
  "*.vercel.app",
  "localhost:3000",
] as const;

export const authCookieDomain = "pekarenkromka.sk";
