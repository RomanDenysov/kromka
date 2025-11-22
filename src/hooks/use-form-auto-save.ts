import { type FocusEvent, useRef } from "react";

type AutoSaveFormApi = {
  handleSubmit: () => void;
  state: {
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
  };
};

type UseFormAutoSaveOptions = {
  blurDelay?: number;
};

export function useFormAutoSave(
  form: AutoSaveFormApi,
  options: UseFormAutoSaveOptions = {}
) {
  const { blurDelay = 100 } = options;
  const formRef = useRef<HTMLFormElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBlurCapture = (_e: FocusEvent<HTMLFormElement>) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;

      // Check if focus is still inside the form OR inside a known portal (Radix UI/Shadcn)
      // This prevents auto-save when opening a Dropdown, Select, or Dialog
      const isStillInForm =
        formRef.current?.contains(activeElement) ||
        activeElement?.closest("[data-radix-portal]") ||
        activeElement?.closest('[role="dialog"]') ||
        activeElement?.closest('[role="menu"]') ||
        activeElement?.closest('[role="listbox"]');

      if (
        !isStillInForm &&
        form.state.isValid &&
        form.state.isDirty &&
        !form.state.isSubmitting
      ) {
        form.handleSubmit();
      }
    }, blurDelay);
  };

  const handleFocusCapture = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  return {
    formRef,
    onBlurCapture: handleBlurCapture,
    onFocusCapture: handleFocusCapture,
  };
}
