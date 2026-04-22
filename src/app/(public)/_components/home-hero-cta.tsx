"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { FadeDiv } from "@/components/motion/fade";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rowClassName =
  "flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center md:justify-center md:gap-4";

export type HomeHeroCtaVariant = "overlay" | "surface";

interface HomeHeroCtaProps {
  animated?: boolean;
  className?: string;
  variant?: HomeHeroCtaVariant;
}

/**
 * Primary homepage hero actions — same targets as {@link HomeHero}.
 * `overlay` matches buttons on the full-bleed hero; `surface` is for light sections.
 */
export function HomeHeroCta({
  animated = true,
  className,
  variant = "overlay",
}: HomeHeroCtaProps) {
  const isOverlay = variant === "overlay";

  const primary = (
    <Link
      className={cn(
        buttonVariants({
          variant: isOverlay ? "glass" : "brand",
          size: "xl",
        }),
        "group w-full justify-center text-shadow-2xs shadow-sm md:w-auto"
      )}
      href="/e-shop"
    >
      Objednať online
      <ArrowRight className="size-3.5" />
    </Link>
  );

  const secondary = (
    <Link
      className={cn(
        buttonVariants({
          variant: isOverlay ? "link" : "outline",
          size: "xl",
        }),
        isOverlay
          ? "group min-h-11 w-full justify-center text-white no-underline transition-colors duration-200 ease-out hover:no-underline active:text-white/90 motion-reduce:duration-0 md:w-auto md:hover:text-white/80"
          : "group min-h-11 w-full justify-center text-shadow-2xs shadow-sm md:w-auto"
      )}
      href="/predajne"
    >
      <MapPin className="size-3.5" />
      Naše predajne
    </Link>
  );

  if (!animated) {
    return (
      <div className={cn(rowClassName, className)}>
        {primary}
        {secondary}
      </div>
    );
  }

  return (
    <div className={cn(rowClassName, className)}>
      <FadeDiv>{primary}</FadeDiv>
      <FadeDiv>{secondary}</FadeDiv>
    </div>
  );
}
