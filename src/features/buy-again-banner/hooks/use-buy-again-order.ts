import { useTransition } from "react";
import { toast } from "sonner";
import { addItemsToCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";

interface OrderItem {
  priceCents: number;
  productId: string;
  quantity: number;
}

export function useBuyAgainOrder(onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();

  const repeatOrder = (items: OrderItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );
    startTransition(async () => {
      try {
        await addItemsToCart(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        );
        analytics.orderRepeated({
          item_count: items.length,
          total,
        });
        onSuccess?.();
      } catch {
        toast.error("Nastala chyba pri pridavani produktov do kosika");
      }
    });
  };

  return { isPending, repeatOrder };
}
