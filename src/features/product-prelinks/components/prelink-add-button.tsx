"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { addToCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";

interface Props {
  priceCents: number;
  productId: string;
  productName: string;
}

export function PrelinkAddButton({
  productId,
  productName,
  priceCents,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await addToCart(productId, 1);
        analytics.productAdded({
          product_id: productId,
          product_name: productName,
          price: priceCents,
          quantity: 1,
          cart_type: "b2c",
          source: "product_prelink",
        });
      } catch (_error) {
        toast.error("Pridanie do košíka zlyhalo. Skúste to znova.");
      }
    });
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleClick}
      size="sm"
      type="button"
      variant="default"
    >
      {isPending ? <Spinner /> : <ShoppingCartIcon className="size-4" />}
      <span>Do košíka</span>
    </Button>
  );
}
