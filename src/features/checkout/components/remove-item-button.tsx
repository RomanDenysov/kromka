"use client";

import { XIcon } from "lucide-react";
import { useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { removeFromCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Props = ButtonProps & {
  id: string;
  iconClassName?: string;
  onRemove?: (productId: string) => Promise<void>;
  productInfo?: { name: string; quantity: number };
};

export function RemoveItemButton({
  id,
  variant = "ghost",
  size = "icon-sm",
  iconClassName,
  onRemove,
  productInfo,
  ...props
}: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      aria-label="Odstrániť z košíka"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          if (onRemove) {
            await onRemove(id);
          } else {
            await removeFromCart(id);
          }
          if (productInfo) {
            analytics.productRemoved({
              product_id: id,
              product_name: productInfo.name,
              quantity: productInfo.quantity,
            });
          }
        })
      }
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <XIcon className={cn("size-5 sm:size-6", iconClassName)} />
      )}
      <span className="sr-only">Odstrániť z košíka</span>
    </Button>
  );
}
