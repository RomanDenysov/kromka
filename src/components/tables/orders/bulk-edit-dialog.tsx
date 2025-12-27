"use client";

import { MailIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus, PaymentStatus } from "@/db/types";
import { bulkUpdateOrdersAction } from "@/lib/actions/orders";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

const NO_CHANGE_VALUE = "__no_change__";

type BulkEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderIds: string[];
  onSuccess?: () => void;
};

export function BulkEditDialog({
  open,
  onOpenChange,
  selectedOrderIds,
  onSuccess,
}: BulkEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [orderStatus, setOrderStatus] = useState<string>(NO_CHANGE_VALUE);
  const [paymentStatus, setPaymentStatus] = useState<string>(NO_CHANGE_VALUE);

  const handleSubmit = () => {
    const newOrderStatus =
      orderStatus !== NO_CHANGE_VALUE
        ? (orderStatus as OrderStatus)
        : undefined;
    const newPaymentStatus =
      paymentStatus !== NO_CHANGE_VALUE
        ? (paymentStatus as PaymentStatus)
        : undefined;

    if (!(newOrderStatus || newPaymentStatus)) {
      toast.error("Vyberte aspoň jeden stav na zmenu");
      return;
    }

    startTransition(async () => {
      const result = await bulkUpdateOrdersAction({
        orderIds: selectedOrderIds,
        orderStatus: newOrderStatus,
        paymentStatus: newPaymentStatus,
      });

      if (result.success) {
        toast.success(
          `Úspešne aktualizovaných ${result.updatedCount} objednávok`
        );
        setOrderStatus(NO_CHANGE_VALUE);
        setPaymentStatus(NO_CHANGE_VALUE);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOrderStatus(NO_CHANGE_VALUE);
      setPaymentStatus(NO_CHANGE_VALUE);
    }
    onOpenChange(newOpen);
  };

  const orderStatusOptions = Object.entries(ORDER_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  const paymentStatusOptions = Object.entries(PAYMENT_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
  );

  const willSendEmails =
    orderStatus !== NO_CHANGE_VALUE &&
    ["in_progress", "ready_for_pickup", "completed"].includes(orderStatus);

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hromadná úprava objednávok</DialogTitle>
          <DialogDescription>
            Upravte stav pre {selectedOrderIds.length} vybraných objednávok.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="orderStatus">Stav objednávky</Label>
            <Select onValueChange={setOrderStatus} value={orderStatus}>
              <SelectTrigger className="w-full" id="orderStatus">
                <SelectValue placeholder="Bez zmeny" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CHANGE_VALUE}>Bez zmeny</SelectItem>
                {orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentStatus">Stav platby</Label>
            <Select onValueChange={setPaymentStatus} value={paymentStatus}>
              <SelectTrigger className="w-full" id="paymentStatus">
                <SelectValue placeholder="Bez zmeny" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CHANGE_VALUE}>Bez zmeny</SelectItem>
                {paymentStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {willSendEmails && (
            <Alert>
              <MailIcon className="size-4" />
              <AlertTitle>Emailové notifikácie</AlertTitle>
              <AlertDescription>
                Zmena stavu objednávky spustí automatické emailové notifikácie
                zákazníkom ({selectedOrderIds.length} emailov).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} variant="outline">
              Zrušiť
            </Button>
          </DialogClose>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Aktualizujem..." : "Potvrdiť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
