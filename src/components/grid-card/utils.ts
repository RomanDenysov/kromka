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
    default:
      return "";
  }
}

export function getImageSizes(size: GridCardSize): string {
  switch (size) {
    case "hero":
      return "(max-width: 768px) 100vw, 66vw";
    case "large":
      return "(max-width: 768px) 100vw, 50vw";
    default:
      return "(max-width: 768px) 100vw, 33vw";
  }
}
