import type { DetailedCartItem } from "@/lib/cart/queries";
import { formatPrice } from "@/lib/utils";

type CheckoutTotalPriceProps = {
  items: DetailedCartItem[];
  children?: React.ReactNode;
};

export function CheckoutTotalPrice({
  items,
  children,
}: CheckoutTotalPriceProps) {
  const totalCents = items.reduce(
    (acc, item) => acc + item.priceCents * item.quantity,
    0
  );

  return (
    <div className="flex flex-row items-center justify-between">
      <span className="font-medium text-lg">Spolu</span>
      {children || (
        <span className="font-semibold text-lg">{formatPrice(totalCents)}</span>
      )}
    </div>
  );
}
