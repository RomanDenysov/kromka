"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ConfirmFn, ConfirmOptions } from "../types";
import { ConfirmDialog } from "./confirm-dialog";

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      "[ConfirmDialog] useConfirm must be used within a ConfirmProvider"
    );
  }
  return ctx;
}

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolveAndClose = (ok: boolean) => {
    setOpen(false);
    resolverRef.current?.(ok);
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        onCancel={() => resolveAndClose(false)}
        onConfirm={() => resolveAndClose(true)}
        onOpenChange={setOpen}
        open={open}
        options={options}
      />
    </ConfirmContext.Provider>
  );
}
