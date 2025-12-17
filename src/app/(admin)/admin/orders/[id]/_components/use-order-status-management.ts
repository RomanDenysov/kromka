"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import {
  updateOrderPaymentStatusAction,
  updateOrderStatusAction,
} from "@/lib/actions/orders";
import type { Order } from "@/lib/queries/orders";

type UseOrderStatusManagementResult = {
  optimisticOrderStatus: OrderStatus;
  optimisticPaymentStatus: PaymentStatus;
  isPending: boolean;
  statusDialog: {
    isOpen: boolean;
    pendingStatus: OrderStatus | null;
    onValidate: (status: string) => Promise<boolean>;
    onConfirm: () => void;
    onCancel: () => void;
  };
  paymentDialog: {
    isOpen: boolean;
    pendingStatus: PaymentStatus | null;
    onValidate: (status: PaymentStatus) => Promise<boolean>;
    onConfirm: () => void;
    onCancel: () => void;
  };
  handleStatusChange: (status: OrderStatus) => void;
  handlePaymentStatusChange: (status: PaymentStatus) => void;
};

export function useOrderStatusManagement(
  order: Order | undefined
): UseOrderStatusManagementResult {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic state
  const [optimisticOrderStatus, setOptimisticOrderStatus] = useOptimistic(
    order?.orderStatus ?? ("new" as OrderStatus),
    (_currentStatus, newStatus: OrderStatus) => newStatus
  );

  const [optimisticPaymentStatus, setOptimisticPaymentStatus] = useOptimistic(
    (order?.paymentStatus ?? "pending") as PaymentStatus,
    (_currentStatus, newStatus: PaymentStatus) => newStatus
  );

  // Status dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const statusValidationResolverRef = useRef<((value: boolean) => void) | null>(
    null
  );

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [pendingPaymentStatus, setPendingPaymentStatus] =
    useState<PaymentStatus | null>(null);
  const paymentValidationResolverRef = useRef<
    ((value: boolean) => void) | null
  >(null);

  // Cleanup on unmount to prevent memory leaks
  useEffect(
    () =>
      function cleanup() {
        statusValidationResolverRef.current?.(false);
        paymentValidationResolverRef.current?.(false);
      },
    []
  );

  const updateStatus = ({
    id,
    status,
    note,
  }: {
    id: string;
    status: OrderStatus;
    note?: string;
  }) => {
    startTransition(async () => {
      setOptimisticOrderStatus(status);
      try {
        await updateOrderStatusAction({ orderId: id, status, note });
        toast.success("Stav objednávky bol aktualizovaný");
        router.refresh();
      } catch (err) {
        // Revert optimistic update on error
        setOptimisticOrderStatus(order?.orderStatus ?? ("new" as OrderStatus));
        toast.error(
          err instanceof Error ? err.message : "Chyba pri aktualizácii"
        );
      }
    });
  };

  const updatePaymentStatus = ({
    id,
    status,
  }: {
    id: string;
    status: PaymentStatus;
  }) => {
    startTransition(async () => {
      setOptimisticPaymentStatus(status);
      try {
        await updateOrderPaymentStatusAction({ orderId: id, status });
        toast.success("Stav platby bol aktualizovaný");
        router.refresh();
      } catch (err) {
        // Revert optimistic update on error
        setOptimisticPaymentStatus(
          (order?.paymentStatus ?? "pending") as PaymentStatus
        );
        toast.error(
          err instanceof Error ? err.message : "Chyba pri aktualizácii"
        );
      }
    });
  };

  const handleValidateStatus = (status: string): Promise<boolean> => {
    // Prevent race condition: if dialog is already open, reject new request
    if (isStatusDialogOpen) {
      return Promise.resolve(false);
    }

    if (status === order?.orderStatus) {
      return Promise.resolve(false);
    }

    setPendingStatus(status as OrderStatus);
    setIsStatusDialogOpen(true);

    return new Promise((resolve) => {
      statusValidationResolverRef.current = resolve;
    });
  };

  const handleStatusChange = (status: OrderStatus) => {
    if (!order) {
      return;
    }
    updateStatus({ id: order.id, status });
  };

  const handleStatusChangeConfirm = () => {
    statusValidationResolverRef.current?.(true);
    statusValidationResolverRef.current = null;
    setIsStatusDialogOpen(false);
    setPendingStatus(null);
  };

  const handleStatusDialogClose = () => {
    statusValidationResolverRef.current?.(false);
    statusValidationResolverRef.current = null;
    setIsStatusDialogOpen(false);
    setPendingStatus(null);
  };

  const handleValidatePaymentStatus = (
    status: PaymentStatus
  ): Promise<boolean> => {
    // Prevent race condition: if dialog is already open, reject new request
    if (isPaymentDialogOpen) {
      return Promise.resolve(false);
    }

    if (status === order?.paymentStatus) {
      return Promise.resolve(false);
    }

    setPendingPaymentStatus(status);
    setIsPaymentDialogOpen(true);

    return new Promise((resolve) => {
      paymentValidationResolverRef.current = resolve;
    });
  };

  const handlePaymentStatusChange = (status: PaymentStatus) => {
    if (!order) {
      return;
    }
    updatePaymentStatus({ id: order.id, status });
  };

  const handlePaymentStatusChangeConfirm = () => {
    paymentValidationResolverRef.current?.(true);
    paymentValidationResolverRef.current = null;
    setIsPaymentDialogOpen(false);
    setPendingPaymentStatus(null);
  };

  const handlePaymentDialogClose = () => {
    paymentValidationResolverRef.current?.(false);
    paymentValidationResolverRef.current = null;
    setIsPaymentDialogOpen(false);
    setPendingPaymentStatus(null);
  };

  return {
    optimisticOrderStatus,
    optimisticPaymentStatus,
    isPending,
    statusDialog: {
      isOpen: isStatusDialogOpen,
      pendingStatus,
      onValidate: handleValidateStatus,
      onConfirm: handleStatusChangeConfirm,
      onCancel: handleStatusDialogClose,
    },
    paymentDialog: {
      isOpen: isPaymentDialogOpen,
      pendingStatus: pendingPaymentStatus,
      onValidate: handleValidatePaymentStatus,
      onConfirm: handlePaymentStatusChangeConfirm,
      onCancel: handlePaymentDialogClose,
    },
    handleStatusChange,
    handlePaymentStatusChange,
  };
}
