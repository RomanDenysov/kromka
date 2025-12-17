/** biome-ignore-all lint/style/noMagicNumbers: Ignore it for now */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(nameOrEmail: string | null | undefined): string {
  if (!nameOrEmail) {
    return "";
  }

  const parts = nameOrEmail.trim().split(" ").slice(0, 3);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  const { currency = "EUR", notation = "standard" } = options;

  const numericPrice =
    typeof price === "string" ? Number.parseFloat(price) : price;

  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice / 100);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const formatCentsToPrice = (cents: number) => {
  const processedCents = Math.round(cents);
  const price = processedCents / 100;
  return price;
};

export function getSiteUrl(path?: string) {
  // Client-side
  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(path ?? "", window.location.origin).toString();
  }

  // Server-side: prioritize custom domain
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return new URL(path ?? "", url).toString();
}

/**
 * Slovak pluralization for "položka" (item)
 * @param count - Number of items
 * @returns Singular "položka", plural "položky" (2-4), or "položiek" (5+)
 */
export function getItemsLabel(count: number): string {
  if (count === 1) {
    return "položka";
  }
  if (count < 5) {
    return "položky";
  }
  return "položiek";
}
