type CheckoutCartHeaderProps = {
  totals: {
    totalQuantity: number;
  };
};

/**
 * Displays cart item count in checkout header.
 * Receives totals as props from parent to avoid duplicate data fetching.
 */
export function CheckoutCartHeader({ totals }: CheckoutCartHeaderProps) {
  const { totalQuantity } = totals;

  return (
    <span className="font-semibold text-lg">
      Košík ({totalQuantity} {totalQuantity === 1 ? "položka" : "položky"})
    </span>
  );
}
