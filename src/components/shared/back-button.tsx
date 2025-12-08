"use client";

import { ChevronLeftIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button, type ButtonProps } from "../ui/button";

type Props = ButtonProps & {
  href?: Route;
};

export function BackButton({
  href,
  className,
  size = "icon-sm",
  variant = "secondary",
  ...props
}: Props) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  }, [href, router]);

  return (
    <Button
      {...props}
      className={className}
      onClick={handleClick}
      size={size}
      variant={variant}
    >
      {props.children ?? (
        <>
          <ChevronLeftIcon className="size-4" />
          <span className="sr-only">Vrátiť sa späť</span>
        </>
      )}
    </Button>
  );
}
