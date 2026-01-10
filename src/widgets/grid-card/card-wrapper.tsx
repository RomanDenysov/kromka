import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardWrapperProps = {
  children: ReactNode;
  href?: Route | null;
  className?: string;
};

export function CardWrapper({ children, href, className }: CardWrapperProps) {
  if (href) {
    return (
      <Link className={cn(className)} href={href}>
        {children}
      </Link>
    );
  }

  return <article className={cn(className)}>{children}</article>;
}
