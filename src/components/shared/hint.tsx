"use client";

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function Hint({
  children,
  text,
  align = "center",
  side = "right",
}: {
  children: ReactNode;
  text: string;
  align?: "center" | "start" | "end";
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
}) {
  const child = Children.only(children);
  const render = isValidElement(child) ? (child as ReactElement) : undefined;

  return (
    <Tooltip>
      <TooltipTrigger render={render}>
        {render ? undefined : children}
      </TooltipTrigger>
      <TooltipContent align={align} side={side}>
        <span className="font-medium text-xs">{text}</span>
      </TooltipContent>
    </Tooltip>
  );
}
