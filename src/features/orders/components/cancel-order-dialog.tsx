"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cancelOrderAction } from "@/features/orders/api/actions";

interface CancelOrderDialogProps {
  orderId: string;
}

export function CancelOrderDialog({ orderId }: CancelOrderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    setIsPending(true);
    try {
      const result = await cancelOrderAction({
        orderId,
        reason: reason || undefined,
      });

      if (result.success) {
        toast.success("Objednávka bola zrušená");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Nastala chyba. Skúste to znova.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Zrušiť objednávku
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zrušiť objednávku?</AlertDialogTitle>
          <AlertDialogDescription>
            Táto akcia je nevratná. Po zrušení objednávky ju nebude možné
            obnoviť.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Dôvod zrušenia (voliteľné)"
          rows={3}
          value={reason}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Späť</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleCancel}>
            {isPending && <Spinner />}
            Zrušiť objednávku
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
