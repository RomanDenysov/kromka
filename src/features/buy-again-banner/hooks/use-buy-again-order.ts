import { useTransition } from "react";
import { toast } from "sonner";
import { addItemsToCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";
import { useBuyAgainDismiss } from "../store";

interface OrderItem {
  priceCents: number;
  productId: string;
  quantity: number;
}

type Source = "banner" | "banner_dialog" | "cart_drawer" | "reorder_bar";

export function useBuyAgainOrder(onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();
  const dismiss = useBuyAgainDismiss();

  const repeatOrder = (items: OrderItem[], source: Source) => {
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
          source,
        });
        dismiss();
        toast.success("Produkty boli pridane do kosika");
        onSuccess?.();
      } catch {
        toast.error("Nastala chyba pri pridavani produktov do kosika");
      }
    });
  };

  return { isPending, repeatOrder };
}
