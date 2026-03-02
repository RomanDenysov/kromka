import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
  children: ReactNode;
  className?: string;
  external: boolean;
  href?: Route | null;
}

const externalParams = {
  rel: "noopener noreferrer",
  target: "_blank",
};

export function CardWrapper({
  children,
  href,
  className,
  external = false,
}: CardWrapperProps) {
  if (href) {
    return (
      <Link
        className={cn(className)}
        href={href}
        {...(external ? externalParams : {})}
      >
        {children}
      </Link>
    );
  }

  return <article className={cn(className)}>{children}</article>;
}
