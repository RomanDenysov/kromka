import { useCallback, useEffect, useRef } from "react";
import { useCallbackRef } from "./use-callback-ref";

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimeRef = useRef(0);
  useEffect(() => () => window.clearTimeout(debounceTimeRef.current), []);

  const setValue = useCallback(
    (...args: Parameters<T>) => {
      window.clearTimeout(debounceTimeRef.current);
      debounceTimeRef.current = window.setTimeout(() => {
        handleCallback(...args);
      }, delay);
    },
    [handleCallback, delay]
  );

  return setValue;
}
