import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "spinner" | "dots" | "pulse" | "shimmer" | "underline" | "fade";
}
export function LinkStatus({ children, variant, className }: Props) {
  const { pending } = useLinkStatus();

  if (variant === "spinner") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {children}
        {pending && <Spinner className="size-4" />}
      </span>
    );
  }

  if (variant === "dots") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {children}
        {pending && (
          <span className="inline-flex gap-0.5">
            <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="size-1 animate-bounce rounded-full bg-current" />
          </span>
        )}
      </span>
    );
  }

  if (variant === "pulse") {
    return (
      <span className={cn(pending && "animate-pulse", className)}>
        {children}
      </span>
    );
  }

  if (variant === "shimmer") {
    return (
      <span className={cn("relative inline-block", className)}>
        <span className={cn(pending && "opacity-50")}>{children}</span>
        {pending && (
          <span
            className={cn(
              "absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent",
              className
            )}
            style={{ backgroundSize: "200% 100%" }}
          />
        )}
      </span>
    );
  }

  if (variant === "underline") {
    return (
      <span className={cn("relative inline-block", className)}>
        {children}
        {pending && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left animate-progress bg-current" />
        )}
      </span>
    );
  }

  // Default: fade
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 transition-opacity duration-150",
        pending && "opacity-50"
      )}
    >
      {children}
    </span>
  );
}
