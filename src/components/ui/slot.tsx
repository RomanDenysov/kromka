"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type SlotProps = {
  children?: ReactNode;
} & Record<string, unknown>;

/**
 * Base UI-compatible replacement for `@radix-ui/react-slot`.
 * Merges props onto the single child element (same API as Radix Slot).
 */
function Slot({ children, ...props }: SlotProps) {
  const child = Children.only(children);

  if (!isValidElement(child)) {
    return null;
  }

  return cloneElement(child as ReactElement, props);
}

const Root = Slot;
Slot.Root = Slot;

export { Root, Slot };
