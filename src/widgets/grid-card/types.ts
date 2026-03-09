import type { Route } from "next";

export type GridCardSize = "small" | "medium" | "large" | "hero" | "banner";

export interface GridCardProps {
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  color?: string;
  externalLink?: boolean;
  extraSpan?: number;
  href?: Route | null;
  image?: string;
  images?: string[];
  preload: boolean;
  size?: GridCardSize;
  subtitle?: string;
  textColor?: string;
  title: string;
  video?: string;
}

export type GridItemConfig = Omit<GridCardProps, "preload"> & {
  id: string;
  requiresFlag?: string;
};
