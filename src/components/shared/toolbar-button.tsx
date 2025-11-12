"use client";

import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "../ui/button";
import { Spinner } from "../ui/spinner";

type ToolbarButtonProps = ButtonProps & {
  icon: LucideIcon;
  label: string;
  loading?: boolean;
};

export function ToolbarButton({
  icon: Icon,
  label,
  loading,
  size = "xs",
  variant = "outline",
  disabled,
  ...props
}: ToolbarButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      size={size}
      variant={variant}
    >
      {loading ? <Spinner /> : <Icon />}
      {label}
    </Button>
  );
}
