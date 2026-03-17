"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

interface Props {
  itemCount: number;
  orderId: string;
  orderNumber: string;
  totalCents: number;
}

export function OrderConfirmationEvent({
  itemCount,
  orderId,
  orderNumber,
  totalCents,
}: Props) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) {
      return;
    }
    firedRef.current = true;

    analytics.orderConfirmed({
      order_id: orderId,
      order_number: orderNumber,
      total: totalCents,
      item_count: itemCount,
    });
  }, [orderId, orderNumber, totalCents, itemCount]);

  return null;
}
