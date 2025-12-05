import type { Route } from "next";

export type GridCardSize = "small" | "medium" | "large" | "hero";

export type GridCardProps = {
  preload: boolean;
  title: string;
  subtitle?: string;
  href?: Route | null;
  image?: string;
  images?: string[];
  color?: string;
  size?: GridCardSize;
  className?: string;
  textColor?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
};

export type GridItemConfig = Omit<GridCardProps, "preload"> & {
  id: string;
  requiresFlag?: string;
};
