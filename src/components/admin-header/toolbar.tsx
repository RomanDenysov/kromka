import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Toolbar = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cn("flex items-center gap-2", className)} />
);
