"use client";

import type { OrderStatus } from "@/db/types";
import { MODIFIABLE_ORDER_STATUSES } from "@/db/types";
import type { Store } from "@/features/stores/api/queries";
import { CancelOrderDialog } from "./cancel-order-dialog";
import { UpdatePickupDialog } from "./update-pickup-dialog";

interface OrderActionsProps {
  currentPickupDate: string | null;
  currentPickupTime: string | null;
  currentStoreId: string | null;
  orderId: string;
  orderStatus: OrderStatus;
  stores: Store[];
}

export function OrderActions({
  orderId,
  orderStatus,
  currentStoreId,
  currentPickupDate,
  currentPickupTime,
  stores,
}: OrderActionsProps) {
  if (!MODIFIABLE_ORDER_STATUSES.includes(orderStatus)) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <UpdatePickupDialog
        currentPickupDate={currentPickupDate}
        currentPickupTime={currentPickupTime}
        currentStoreId={currentStoreId}
        orderId={orderId}
        stores={stores}
      />
      <CancelOrderDialog orderId={orderId} />
    </div>
  );
}
