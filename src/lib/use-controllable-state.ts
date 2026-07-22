"use client";

import { useCallback, useState } from "react";

interface UseControllableStateParams<T> {
  defaultProp?: T;
  onChange?: (value: T) => void;
  prop?: T;
}

/**
 * Controlled/uncontrolled state hook (replaces `@radix-ui/react-use-controllable-state`).
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T | undefined, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    defaultProp
  );
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
