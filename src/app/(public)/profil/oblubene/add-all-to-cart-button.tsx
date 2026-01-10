"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addToCart } from "@/features/cart/actions";

type Props = {
  productIds: string[];
};

const MAX_PRODUCTS_TO_ADD_TO_CART = 5;

export function AddAllToCartButton({ productIds }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleAddAll = () => {
    if (productIds.length === 0) {
      return;
    }

    startTransition(async () => {
      try {
        for (const productId of productIds) {
          await addToCart(productId, 1);
        }
        toast.success(
          `Pridaných ${productIds.length} ${
            productIds.length === 1
              ? "produkt"
              : // biome-ignore lint/style/noNestedTernary: ignore it for now
                productIds.length < MAX_PRODUCTS_TO_ADD_TO_CART
                ? "produkty"
                : "produktov"
          } do košíka`
        );
      } catch (_error) {
        toast.error("Nastala chyba pri pridávaní produktov do košíka");
      }
    });
  };

  return (
    <Button
      disabled={isPending || productIds.length === 0}
      onClick={handleAddAll}
      size="sm"
      variant="default"
    >
      {isPending ? <Spinner /> : <ShoppingCartIcon className="size-4" />}
      <span>Pridať všetko do košíka</span>
    </Button>
  );
}
