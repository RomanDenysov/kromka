"use client";

import { useQueryStates } from "nuqs";
import { type LoginReason, loginModalParams } from "@/lib/search-params";

export function useLoginModalParams() {
  const [params, setParams] = useQueryStates(loginModalParams);

  const open = (reason?: LoginReason) => {
    setParams({ login: true, reason });
  };

  const close = () => {
    setParams({ login: null, reason: null });
  };

  return {
    isOpen: params.login,
    reason: params.reason,
    open,
    close,
  };
}
