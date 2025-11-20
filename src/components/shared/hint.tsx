import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Hint({
  children,
  text,
  align = "center",
  side = "right",
  asChild = true,
}: {
  children: ReactNode;
  text: string;
  align?: "center" | "start" | "end";
  side?: "top" | "bottom" | "left" | "right";
  asChild?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
      <TooltipContent align={align} side={side} sideOffset={4}>
        <span className="font-medium text-xs">{text}</span>
      </TooltipContent>
    </Tooltip>
  );
}
