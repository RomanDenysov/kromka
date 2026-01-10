import { getCartTotals, getDetailedCart } from "@/features/cart/queries";

export async function CheckoutCartHeader() {
  const items = await getDetailedCart();
  const totals = getCartTotals(items);
  const { totalQuantity } = totals;

  return (
    <span className="font-semibold text-lg">
      Košík ({totalQuantity} {totalQuantity === 1 ? "položka" : "položky"})
    </span>
  );
}
