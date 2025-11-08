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
