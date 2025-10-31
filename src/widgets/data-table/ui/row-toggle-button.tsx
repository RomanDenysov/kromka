"use client";

import { useCallback } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

type Props = ButtonProps & {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function RowToggleButton({
  value,
  onChange,
  children,
  ...props
}: Props) {
  const handleClick = useCallback(() => onChange(!value), [value, onChange]);

  return (
    <Button
      aria-pressed={value}
      data-state={value ? "on" : "off"}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}
