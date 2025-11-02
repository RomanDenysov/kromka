"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = Omit<ButtonProps, "value"> & {
  isActive: boolean;
  onToggle: () => void;
};

export function RowToggleButton({
  isActive,
  onToggle,
  className,
  ...props
}: Props) {
  return (
    <Button
      aria-pressed={isActive}
      className={cn("w-24", className)}
      data-state={isActive ? "on" : "off"}
      onClick={onToggle}
      type="button"
      variant={isActive ? "default" : "outline"}
      {...props}
    >
      {isActive ? (
        <>
          Aktívny <CheckIcon className="size-4" />
        </>
      ) : (
        <>
          Neaktívny <XIcon className="size-4" />
        </>
      )}
    </Button>
  );
}
