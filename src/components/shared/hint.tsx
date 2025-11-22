"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Hint({
  children,
  text,
  align = "center",
  side = "right",
  asChild = true,
  delay,
}: {
  children: ReactNode;
  text: string;
  align?: "center" | "start" | "end";
  side?: "top" | "bottom" | "left" | "right";
  asChild?: boolean;
  delay?: number;
}) {
  return (
    <Tooltip delayDuration={delay ?? 0}>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent align={align} side={side} sideOffset={4}>
        <span className="font-medium text-xs">{text}</span>
      </TooltipContent>
    </Tooltip>
  );
}
