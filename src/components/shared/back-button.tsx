"use client";

import { ArrowLeftIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { usePageTrackerStore } from "react-page-tracker";
import { Button, type ButtonProps } from "../ui/button";

type Props = ButtonProps & {
  fallbackRoute?: Route;
  ariaLabel?: string;
};

export function BackButton({
  fallbackRoute = "/",
  ariaLabel = "Go back",
  onClick,
  className,
  ...props
}: Props) {
  const router = useRouter();
  const isFirstPage = usePageTrackerStore((state) => state.isFirstPage);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (isFirstPage) {
        router.push(fallbackRoute);
      } else {
        router.back();
      }
    },
    [fallbackRoute, router, onClick, isFirstPage]
  );

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={className}
      onClick={handleClick}
      size="icon-sm"
      variant="secondary"
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  );
}
