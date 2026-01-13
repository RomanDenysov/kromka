import { formatPrice } from "@/lib/utils";

type CheckoutSummaryCardProps = {
  totalCents: number;
};

/**
 * Displays the total price summary for checkout.
 */
export function CheckoutSummaryCard({ totalCents }: CheckoutSummaryCardProps) {
  return (
    <div className="flex items-center justify-between pt-6">
      <span className="font-semibold">Celkom k úhrade</span>
      <span className="font-bold text-lg">{formatPrice(totalCents)}</span>
    </div>
  );
}
