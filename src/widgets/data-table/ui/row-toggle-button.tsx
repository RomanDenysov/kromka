"use client";

import { useCallback } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = Omit<ButtonProps, "value"> & {
  isActive: boolean;
  onChange: (value: boolean) => void;
};

export function RowToggleButton({
  isActive,
  onChange,
  children,
  ...props
}: Props) {
  const handleClick = useCallback(
    () => onChange(!isActive),
    [isActive, onChange]
  );

  return (
    <Button
      aria-pressed={isActive}
      data-state={isActive ? "on" : "off"}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}
