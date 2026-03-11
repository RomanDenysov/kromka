"use client";

import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { OrderStatus } from "@/db/types";
import { TERMINAL_ORDER_STATUSES } from "@/db/types";

const REFRESH_INTERVAL = 30_000;

interface OrderAutoRefreshProps {
  children: React.ReactNode;
  orderStatus: OrderStatus;
}

export function OrderAutoRefresh({
  children,
  orderStatus,
}: OrderAutoRefreshProps) {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [, setTick] = useState(0);

  const isTerminal = TERMINAL_ORDER_STATUSES.includes(orderStatus);

  const doRefresh = useCallback(() => {
    if (document.visibilityState === "visible") {
      router.refresh();
      setLastUpdated(new Date());
    }
  }, [router]);

  // Refresh interval
  useEffect(() => {
    if (isTerminal) {
      return;
    }

    const interval = setInterval(doRefresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isTerminal, doRefresh]);

  // Update relative time display every 15s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          Aktualizované{" "}
          {formatDistanceToNow(lastUpdated, { locale: sk, addSuffix: true })}
        </span>
        {!isTerminal && (
          <button
            className="text-muted-foreground text-xs hover:text-foreground"
            onClick={doRefresh}
            type="button"
          >
            Obnoviť
          </button>
        )}
      </div>
      {children}
    </>
  );
}
