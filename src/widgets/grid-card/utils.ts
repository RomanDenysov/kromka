/** biome-ignore-all lint/style/noMagicNumbers: Ignore it for now */
import type { GridCardSize } from "./types";

export function getCardSizeClasses(size: GridCardSize): string {
  switch (size) {
    case "small":
      return "col-span-1 min-h-[200px]";
    case "medium":
      return "col-span-1 min-h-[280px] md:col-span-2";
    case "large":
      return "col-span-1 min-h-[320px] md:col-span-2 lg:col-span-3";
    case "hero":
      return "col-span-1 min-h-[500px] md:col-span-2 lg:col-span-4 lg:min-h-[600px]";
    case "banner":
      return "col-span-1 min-h-[500px] md:col-span-4 md:min-h-[600px] lg:col-span-6 lg:min-h-[700px]";
    default:
      return "";
  }
}

export function getImageSizes(size: GridCardSize): string {
  switch (size) {
    case "banner":
      return "100vw";
    case "hero":
      return "(max-width: 768px) 100vw, 66vw";
    case "large":
      return "(max-width: 768px) 100vw, 50vw";
    default:
      return "(max-width: 768px) 100vw, 33vw";
  }
}

/** Returns total span class at lg breakpoint (base + extra) */
export function getExtraSpanClass(
  size: GridCardSize,
  extraSpan: number
): string {
  if (extraSpan <= 0) {
    return "";
  }

  const baseSpan: Record<GridCardSize, number> = {
    banner: 6,
    hero: 4,
    large: 3,
    medium: 2,
    small: 1,
  };

  const totalSpan = baseSpan[size] + extraSpan;

  // Static classes for Tailwind detection
  switch (totalSpan) {
    case 2:
      return "lg:col-span-2";
    case 3:
      return "lg:col-span-3";
    case 4:
      return "lg:col-span-4";
    case 5:
      return "lg:col-span-5";
    case 6:
      return "lg:col-span-6";
    default:
      return "";
  }
}
