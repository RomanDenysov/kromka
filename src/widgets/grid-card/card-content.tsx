import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GridCardSize } from "./types";

type CardContentProps = {
  title: string;
  subtitle?: string;
  href?: string | null;
  size: GridCardSize;
  hasImage: boolean;
  textColor?: string;
};

export function CardContent({
  title,
  subtitle,
  href,
  size,
  hasImage,
  textColor,
}: CardContentProps) {
  return (
    <div className="relative z-10 flex h-full flex-col justify-end p-6 lg:p-8">
      <div className="flex items-end justify-between gap-4">
        <div
          className={cn(
            "space-y-2",
            hasImage && !textColor ? "text-white" : textColor
          )}
        >
          {subtitle && (
            <p className="font-medium text-sm opacity-90">{subtitle}</p>
          )}
          <h3
            className={cn(
              "font-bold leading-tight",
              size === "hero" ? "text-3xl lg:text-5xl" : "text-xl lg:text-2xl"
            )}
          >
            {title}
          </h3>
        </div>

        {href && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition-transform group-hover:translate-x-1",
              hasImage ? "bg-white/20 text-white" : "bg-black/5 text-foreground"
            )}
          >
            <ArrowRight className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}
