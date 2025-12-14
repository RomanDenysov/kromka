"use client";

import { useQueryStates } from "nuqs";
import { type LoginReason, loginModalParams } from "@/lib/search-params";

export function useLoginModalParams() {
  const [params, setParams] = useQueryStates(loginModalParams);

  const open = (reason: LoginReason = "default", origin?: string) => {
    setParams({ login: true, reason, origin: origin ?? null });
  };

  const close = () => {
    setParams({ login: null, reason: null, origin: null });
  };

  return {
    isOpen: params.login,
    reason: params.reason,
    origin: params.origin,
    open,
    close,
  };
}
