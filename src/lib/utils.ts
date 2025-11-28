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

  const parts = nameOrEmail.trim().split(" ");
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
