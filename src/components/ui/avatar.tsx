"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  delayMs,
  delay,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback> & {
  /** @deprecated Radix compat — use `delay` */
  delayMs?: number;
}) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        className
      )}
      data-slot="avatar-fallback"
      delay={delayMs ?? delay}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
