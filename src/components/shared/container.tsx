import type { ComponentProps, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Props = PropsWithChildren<ComponentProps<"div">>;

export function Container({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "container mx-auto size-full px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}

export function PageWrapper({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "container mx-auto w-full space-y-6 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 md:pb-16 lg:space-y-8 lg:px-8 xl:pb-20",
        className
      )}
      {...props}
    />
  );
}
