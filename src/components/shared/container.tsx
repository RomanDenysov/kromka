import type { ComponentProps, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Props = PropsWithChildren<ComponentProps<"div">>;

export function Container({ className, ...props }: Props) {
  return (
    <div
      className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
