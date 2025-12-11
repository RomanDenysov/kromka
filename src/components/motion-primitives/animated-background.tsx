"use client";

import type { ComponentProps } from "react";
import { MotionDiv } from "@/components/motion/motion-wrapper";
import { cn } from "@/lib/utils";

type AnimatedBackgroundProps = ComponentProps<typeof MotionDiv> & {
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  className,
  enableHover,
  ...props
}: AnimatedBackgroundProps) {
  return (
    <MotionDiv
      className={cn("relative", enableHover && "group", className)}
      {...props}
    >
      {children}
    </MotionDiv>
  );
}
