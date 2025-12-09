export const EMAIL_BODY_CLASS =
  "mx-auto bg-[#f7f7f7] px-2 py-8 font-sans text-[#111111]";

export const EMAIL_CONTAINER_CLASS =
  "mx-auto my-[24px] w-full max-w-[640px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

export const EMAIL_CARD_CLASS =
  "rounded-xl border border-gray-100 bg-gray-50 p-5 leading-6 text-gray-700";

export const EMAIL_SUBTITLE_CLASS =
  "text-xs font-semibold uppercase text-gray-500";

export const EMAIL_HEADING_CLASS =
  "text-2xl font-semibold text-gray-900 tracking-tight";

export const EMAIL_PARAGRAPH_CLASS = "text-sm leading-6 text-gray-600";

export const EMAIL_MUTED_TEXT_CLASS = "text-xs leading-5 text-gray-500";

export function getBaseUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
}

export function buildAssetUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${getBaseUrl()}/${normalizedPath}`;
}

export const DEFAULT_LOGO_URL = buildAssetUrl("logo-kromka.png");

export const DEFAULT_SIGNATURE_LOGO_URL = buildAssetUrl("kromka-sign.png");

export const DEFAULT_SUPPORT_EMAIL = "support@pekarenkromka.sk";

export const DEFAULT_CONTACT_PHONES = [
  { label: "Prešov", phone: "+421908889550" },
  { label: "Košice: Kuzmányho", phone: "+421907993881" },
  { label: "Košice: Masarykova", phone: "+421919085558" },
] as const;

export function formatOrderCode(orderId: string | number) {
  const raw = typeof orderId === "number" ? orderId.toString() : orderId;
  if (!raw) {
    return "#";
  }

  return raw.startsWith("#") ? raw : `#${raw}`;
}

export function getEmailAssetUrl(path: string) {
  return buildAssetUrl(path);
}
